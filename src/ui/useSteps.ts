import { useCallback, useEffect, useRef, useState } from 'react';
import { connectSteps, readTodaySteps, enableLiveSteps, listenToSteps, stopLiveSteps } from '../adapters/health.ts';
import type { StepSnapshot } from '../health/steps.ts';

export function useSteps(ledger: Readonly<Record<string, number>> = {}, enabled = true) {
  const ledgerRef = useRef(ledger);
  ledgerRef.current = ledger;
  const [snapshot, setSnapshot] = useState<StepSnapshot>({ status: 'unavailable', count: null, checkedAt: null });
  const [initialized, setInitialized] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef<number | null>(null);
  const epoch = useRef(0);
  const refresh = useCallback(async (requestAccess = false) => {
    const version = epoch.current;
    if (!enabled || pending.current === version || (!requestAccess && document.hidden)) return;
    pending.current = version;
    setBusy(true);
    try {
      let next = await (requestAccess ? connectSteps() : readTodaySteps());
      if (version !== epoch.current) return;
      if (next.status === 'ready') next = await enableLiveSteps(requestAccess, ledgerRef.current[next.dayKey ?? ''] ?? next.count ?? 0);
      if (version === epoch.current) setSnapshot(next);
    }
    catch { if (version === epoch.current) setSnapshot({ status: 'error', count: null, checkedAt: null }); }
    finally { if (pending.current === version) pending.current = null; if (version === epoch.current) { setBusy(false); setInitialized(true); } }
  }, [enabled]);
  useEffect(() => {
    if (!enabled) { epoch.current++; pending.current = null; setSnapshot({ status: 'unavailable', count: null, checkedAt: null }); setInitialized(false); setBusy(false); return; }
    const resume = () => { void refresh(); };
    let active = true;
    const subscription = listenToSteps(next => { if (active) setSnapshot(next); });
    resume();
    const timer = window.setInterval(resume, 3000);
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', resume);
    return () => { active = false; epoch.current++; pending.current = null; void subscription.then(listener => listener.remove()).catch(() => {}); void stopLiveSteps().catch(() => {}); clearInterval(timer); window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume); };
  }, [refresh, enabled]);
  return { snapshot, busy, initialized, refresh };
}
