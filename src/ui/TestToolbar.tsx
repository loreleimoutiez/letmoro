import { useEffect, useState } from 'react';
import type { Run, Action } from '../domain/prologue.ts';
import type { en } from '../content/ui.ts';

export const internalTools = import.meta.env.DEV || import.meta.env.VITE_INTERNAL_TOOLS === 'true';
export function TestToolbar({ run, text: t, count, act, restart, intro }: {
  run: Run; text: typeof en; count: number | null; act: (action: Action) => void; restart: () => void; intro: () => void;
}) {
  const [coins, setCoins] = useState(String(run.sous));
  const [steps, setSteps] = useState('');
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setCoins(String(run.sous)), [run.sous]);
  const valid = (value: string, min: number, max: number) => value.trim() !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= max;
  return <aside className="test-toolbar" aria-label={t.testTools}>
    <div className="test-commands"><span>{t.testTools}</span><button onClick={intro}>{t.replayIntro}</button><button onClick={() => setConfirming(true)}>{t.resetApp}</button></div>
    {confirming && <div className="test-reset" role="group" aria-label={t.resetConfirm}><p>{t.resetConfirm}</p><button onClick={() => { setConfirming(false); restart(); }}>{t.resetApp}</button><button onClick={() => setConfirming(false)}>{t.cancel}</button></div>}
    <div className="test-values">
      <form onSubmit={event => { event.preventDefault(); if (valid(coins, 0, 1000000000)) act({ type: 'test-coins', amount: Number(coins) }); }}>
        <label>{t.coins}<input aria-label={t.testCoins} type="number" inputMode="numeric" min="0" max="1000000000" step="1" value={coins} onChange={event => setCoins(event.target.value)} /></label><button disabled={!valid(coins, 0, 1000000000)}>{t.applyValue}</button>
      </form>
      <form onSubmit={event => { event.preventDefault(); if (valid(steps, 1, 100000)) { act({ type: 'steps', amount: Number(steps) }); setSteps(''); } }}>
        <label>{count === null ? '—' : count} {t.steps} · {run.simulatedSteps} {t.fictionalSteps}<input aria-label={t.testSteps} type="number" inputMode="numeric" min="1" max="100000" step="1" placeholder="+" value={steps} onChange={event => setSteps(event.target.value)} /></label><button disabled={!valid(steps, 1, 100000)}>{t.addSteps}</button>
      </form>
    </div>
  </aside>;
}
