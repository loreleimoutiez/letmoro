import { useEffect, useState } from 'react';
import { addDays, civilDate, closedAt, validDate } from '../domain/lives.ts';
import type { Run, Action } from '../domain/prologue.ts';
import type { en } from '../content/ui.ts';

export const internalTools = import.meta.env.DEV || import.meta.env.VITE_INTERNAL_TOOLS === 'true';
export function TestToolbar({ run, text: t, count, act, restart, intro }: {
  run: Run; text: typeof en; count: number | null; act: (action: Action) => void; restart: () => void; intro: () => void;
}) {
  const [coins, setCoins] = useState(String(run.sous));
  const [steps, setSteps] = useState('');
  const [showLife, setShowLife] = useState(false);
  const [day, setDay] = useState(() => addDays(civilDate(Date.now(), run.life.calendar?.zone ?? 'UTC'), -7));
  const [daySteps, setDaySteps] = useState('0');
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setCoins(String(run.sous)), [run.sous]);
  const valid = (value: string, min: number, max: number) => value.trim() !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= min && Number(value) <= max;
  const dayReady = Boolean(run.life.calendar && validDate(day) && Date.parse(closedAt(day, run.life.calendar.zone)) + 86400000 <= Date.now());
  return <aside className="test-toolbar" aria-label={t.testTools}>
    <div className="test-commands"><button onClick={() => setShowLife(value => !value)} aria-expanded={showLife}>{t.lifeTest}</button><button onClick={intro}>{t.replayIntro}</button><button onClick={() => setConfirming(true)}>{t.resetApp}</button></div>
    {confirming && <div className="test-reset" role="group" aria-label={t.resetConfirm}><p>{t.resetConfirm}</p><button onClick={() => { setConfirming(false); restart(); }}>{t.resetApp}</button><button onClick={() => setConfirming(false)}>{t.cancel}</button></div>}
    {showLife && <form className="test-life" onSubmit={event => {
      event.preventDefault();
      if (!run.life.calendar || !day || !valid(daySteps, 0, 1000000)) return;
      const end = closedAt(day, run.life.calendar.zone);
      if (Date.parse(end) + 86400000 > Date.now()) return;
      act({ type: 'life-day', day: { date: day, steps: Number(daySteps), complete: true, source: 'test', closedAt: end, observedAt: new Date().toISOString() } });
      setDay(addDays(day, 1));
    }}><label>{t.lifeTestDate}<input type="date" value={day} onChange={event => setDay(event.target.value)} required /></label><label>{t.lifeTestSteps}<input type="number" min="0" max="1000000" value={daySteps} onChange={event => setDaySteps(event.target.value)} required /></label><button disabled={!dayReady || !valid(daySteps, 0, 1000000)}>{t.recordTestDay}</button></form>}
    <div className="test-values">
      <form onSubmit={event => { event.preventDefault(); if (valid(coins, 0, 1000000000)) act({ type: 'test-coins', amount: Number(coins) }); }}>
        <label>{t.coins}<input aria-label={t.testCoins} disabled={run.life.lives === 0} type="number" inputMode="numeric" min="0" max="1000000000" step="1" value={coins} onChange={event => setCoins(event.target.value)} /></label><button disabled={run.life.lives === 0 || !valid(coins, 0, 1000000000)}>{t.applyValue}</button>
      </form>
      <form onSubmit={event => { event.preventDefault(); if (valid(steps, 1, 100000)) { act({ type: 'steps', amount: Number(steps) }); setSteps(''); } }}>
        <label>{count === null ? '—' : count} {t.steps} · {run.simulatedSteps} {t.fictionalSteps}<input aria-label={t.testSteps} disabled={run.life.lives === 0} type="number" inputMode="numeric" min="1" max="100000" step="1" placeholder="+" value={steps} onChange={event => setSteps(event.target.value)} /></label><button disabled={run.life.lives === 0 || !valid(steps, 1, 100000)}>{t.addSteps}</button>
      </form>
    </div>
  </aside>;
}
