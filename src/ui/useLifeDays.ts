import { useEffect, useState } from 'react';
import type { Run } from '../domain/prologue.ts';
import { apply } from '../domain/prologue.ts';
import { addDays, civilDate } from '../domain/lives.ts';
import type { LifeDay } from '../domain/lives.ts';
import { readClosedStepDays } from '../adapters/health.ts';

// Real zero-day penalties stay gated until the new history adapter is device-validated.
export const realLifeRules = import.meta.env.VITE_LIFE_RULES === 'true';
export function useLifeDays(owner: string | null, calendar: Run['life']['calendar'], connected: boolean, getRun: (expectedOwner?: string) => Run | null, store: (run: Run) => void) {
  const [status, setStatus] = useState<'disabled' | 'ready' | 'unavailable'>('disabled');
  useEffect(() => {
    if (!realLifeRules || !owner || !calendar || !connected) return;
    let active = true, pending = false;
    async function refresh() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const old = Object.values(getRun(owner!)?.life.days ?? {}).filter(day => day.source === 'health' && day.date < addDays(civilDate(Date.now(), calendar!.zone), -28)).map(day => day.date).sort();
        const cursorKey = `letmoro.life-history-cursor.${owner}`;
        let cursor = 0; try { const saved = Number(localStorage.getItem(cursorKey)); cursor = Number.isSafeInteger(saved) && saved >= 0 ? saved : 0; } catch { /* Cursor storage is optional. */ }
        const recheck = old.length ? Array.from({ length: Math.min(7, old.length) }, (_, index) => old[(cursor + index) % old.length]) : [];
        const raw = await readClosedStepDays(civilDate(calendar!.startedAt, calendar!.zone), calendar!.zone, recheck) as { status?: string; days?: unknown[] };
        if (!active) return;
        if (raw?.status !== 'ready' || !Array.isArray(raw.days) || raw.days.length > 35) { setStatus('unavailable'); return; }
        if (old.length) { try { localStorage.setItem(cursorKey, String((cursor + recheck.length) % old.length)); } catch { /* Keep processing valid observations without cursor persistence. */ } }
        let next = getRun(owner!);
        if (!next || next.life.calendar?.startedAt !== calendar!.startedAt || next.life.calendar.zone !== calendar!.zone) return;
        for (const value of raw.days) {
          const day = { ...(value as LifeDay), source: 'health' as const };
          const previous = next.life.days[day.date];
          if (previous?.source === 'health' && previous.steps === day.steps && previous.complete === day.complete) continue;
          next = apply(next, { type: 'life-day', day, at: new Date().toISOString() });
        }
        if (active && next !== getRun(owner!)) store(next);
        setStatus('ready');
      } catch { if (active) setStatus('unavailable'); }
      finally { pending = false; }
    }
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 15 * 60 * 1000);
    const resume = () => { void refresh(); };
    window.addEventListener('focus', resume); document.addEventListener('visibilitychange', resume);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume); };
  }, [owner, calendar, connected, getRun, store]);
  return status;
}
