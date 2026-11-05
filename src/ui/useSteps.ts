import { useCallback, useEffect, useRef, useState } from 'react';
import { connectSteps, readTodaySteps } from '../adapters/health.ts';
import type { StepSnapshot } from '../health/steps.ts';

// Observations stay in memory and never enter the narrative event log or storage.
export function useSteps() {
  const [snapshot, setSnapshot] = useState<StepSnapshot>({ status: 'unavailable', count: null, checkedAt: null });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const refresh = useCallback(async (requestAccess = false) => {
    if (pending.current || (!requestAccess && document.hidden)) return;
    pending.current = true;
    setBusy(true);
    try { setSnapshot(await (requestAccess ? connectSteps() : readTodaySteps())); }
    catch { setSnapshot({ status: 'error', count: null, checkedAt: null }); }
    finally { pending.current = false; setBusy(false); }
  }, []);
  useEffect(() => {
    const resume = () => { void refresh(); };
    resume();
    const timer = window.setInterval(resume, 15000);
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', resume);
    return () => { clearInterval(timer); window.removeEventListener('focus', resume); document.removeEventListener('visibilitychange', resume); };
  }, [refresh]);
  return { snapshot, busy, refresh };
}
