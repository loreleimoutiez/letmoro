import { useCallback, useEffect, useRef, useState } from 'react';
import { connectSteps, readTodaySteps, enableLiveSteps, listenToSteps, stopLiveSteps } from '../adapters/health.ts';
import type { StepSnapshot } from '../health/steps.ts';

export function useSteps(ledger: Readonly<Record<string, number>> = {}, enabled = true) {
  const ledgerRef = useRef(ledger);
  ledgerRef.current = ledger;
  const [snapshot, setSnapshot] = useState<StepSnapshot>({ status: 'unavailable', count: null, checkedAt: null });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const refresh = useCallback(async (requestAccess = false) => {
    if (!enabled || pending.current || (!requestAccess && document.hidden)) return;
    pending.current = true;
    setBusy(true);
    try {
      let next = await (requestAccess ? connectSteps() : readTodaySteps());
      if (next.status === 'ready') next = await enableLiveSteps(requestAccess, ledgerRef.current[next.dayKey ?? ''] ?? next.count ?? 0);
      setSnapshot(next);
    }
    catch { setSnapshot({ status: 'error', count: null, checkedAt: null }); }
    finally { pending.current = false; setBusy(false); }
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const resume = () => { void refresh(); };
    let active = true;
    const subscription = listenToSteps(next => { if (active) setSnapshot(next); });
    resume();
    const timer = window.setInterval(resume, 3000);
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', resume);
    return () => { active = false; void subscription.then(listener => listener.remove()).catch(() => {}); void stopLiveSteps().catch(() => {}); clearInterval(timer); window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume); };
  }, [refresh, enabled]);
  return { snapshot, busy, refresh };
}
