import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apply, createRun, travelCost } from './domain/prologue.ts';
import type { Action, Run } from './domain/prologue.ts';
import { prologue, journalText } from './content/prologue.en.ts';
import { decodeSave, encodeSave, SAVE_KEY } from './adapters/save.ts';
import { themeAt } from './ui/time.ts';
import './style.css';

function initial(): { run: Run | null; warning: string } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return { run: raw ? decodeSave(raw) : null, warning: '' };
  } catch {
    return { run: null, warning: 'The saved trial could not be read. It has been kept. You can start a new trial explicitly below.' };
  }
}
function App() {
  const [loaded] = useState(initial);
  const [run, setRun] = useState(loaded.run);
  const [warning, setWarning] = useState(loaded.warning);
  const [goal, setGoal] = useState('5000');
  const [now, setNow] = useState(() => new Date());
  const [resetting, setResetting] = useState(false);
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  function store(next: Run) {
    setRun(next);
    try { localStorage.setItem(SAVE_KEY, encodeSave(next)); setWarning(''); }
    catch { setWarning('Browser storage is unavailable or full. This trial will last only while this page stays open.'); }
  }
  function act(action: Action) { if (run) store(apply(run, action)); }
  const scene = run ? prologue.scenes[run.stage] : null;
  const traveling = run && (run.stage === 'street' || run.stage === 'delivery');
  const route = run?.stage === 'street' ? 0 : run?.stage === 'job' || run?.stage === 'rest' || run?.stage === 'delivery' ? 1 : 2;
  return <div className="app" data-theme={themeAt(now)}>
    <a className="skip" href="#story">Skip to story</a>
    <header><a className="brand" href="./">letmoro<span className="brand-pixel" /></a><span>Internal trial · simulated steps</span></header>
    <main>
      <div className="intro"><p className="eyebrow">A letter-delivery adventure</p><p>Small steps. A life of your own.</p></div>
      {warning && <p role="alert" className="notice">{warning}</p>}
      {!run ? <section className="onboarding" id="story"><p className="eyebrow">Before the beginning</p><h1>A little room for tomorrow.</h1><p>Meet Moro in a short, unfinished prologue. This internal trial uses buttons to simulate walking. It reads no health data.</p><form onSubmit={event => { event.preventDefault(); const value = Number(goal); if (Number.isSafeInteger(value) && value >= 1 && value <= 100000) store(createRun(value)); }}><label htmlFor="goal">Your personal daily step goal</label><input id="goal" type="number" min="1" max="100000" step="1" required value={goal} onChange={event => setGoal(event.target.value)} /><p className="muted">Any goal is welcome. Trial journeys scale with this number; it stays fixed for this trial.</p><button type="submit">Begin the trial</button></form></section> : <>
        <div className="layout">
          <section className="world-panel" aria-label="Discovered surroundings">
            <div className="world-heading"><span>{scene!.place}</span><span>{themeAt(now)} · local time</span></div>
            <div className="world" role="img" aria-label={`Abstract square-pixel scene. Moro is ${scene!.place.toLowerCase()}. Only the places reached so far are shown.`}>
              {Array.from({ length: route === 0 ? 3 : route === 1 ? 8 : 16 }, (_, i) => <i key={`path${i}`} className="pixel path" style={{ left: `${12 + i * 4.5}%`, top: '64%' }} />)}
              {[0, 1, 2, 3, 4, 5].map(i => <i key={i} className="pixel verge" style={{ left: `${16 + i * 11}%`, top: `${i % 2 ? 41 : 78}%` }} />)}
              {route >= 1 && <i className="pixel office" />}
              {route >= 2 && <i className="pixel courtyard" />}
              <i className={`pixel moro position-${route}`} />
            </div>
            <p className="legend"><i className="moro-swatch" /> Moro <span>Fictional surroundings · no GPS</span></p>
            <div className="stats"><div><strong>{run.sous} sous</strong><span>In your pocket</span></div><div><strong>{run.delivered}</strong><span>Letters delivered intact</span></div></div>
          </section>
          <section className="story" id="story" aria-labelledby="scene-title"><p className="eyebrow">Prologue · a beginning</p><div aria-live="polite" aria-atomic="true"><h1 id="scene-title">{scene!.title}</h1><p className="lead">{scene!.text}</p><p>{scene!.detail}</p></div>
            {run.stage === 'settlement' && <dl className="receipt"><div><dt>Delivery</dt><dd>+8 sous</dd></div><div><dt>Road maintenance contribution</dt><dd>−2 sous</dd></div><div><dt>Exceptional contribution to maintaining contributions</dt><dd>−2 sous</dd></div><div><dt>Take-home pay</dt><dd>4 sous</dd></div></dl>}
            <div className="actions">
              {traveling && <><p>{travelCost(run)} simulated steps needed · {run.reserve} in reserve</p><progress aria-label="Journey steps available" value={Math.min(run.reserve, travelCost(run))} max={travelCost(run)} /><button disabled={run.reserve < travelCost(run)} onClick={() => act({ type: run.stage === 'street' ? 'cross' : 'arrive' })}>{run.stage === 'street' ? 'Cross the fictional street' : 'Enter the courtyard'}</button></>}
              {run.stage === 'job' && <><button onClick={() => act({ type: 'accept' })}>Accept the letter</button><button className="secondary" onClick={() => act({ type: 'rest' })}>Take a moment outside</button></>}
              {run.stage === 'handover' && <button onClick={() => act({ type: 'deliver' })}>Hand over the sealed letter</button>}
              {run.stage === 'settlement' && <button onClick={() => act({ type: 'settle' })}>Collect the payment</button>}
              {(run.stage === 'complete' || run.stage === 'rest') && <p className="notice">End of this internal draft. The full campaign, Android application, and health integration are still to come.</p>}
            </div>
          </section>
        </div>
        <section className="simulation" aria-labelledby="simulation-title"><div><h2 id="simulation-title">Walking simulator</h2><p>{run.simulatedSteps} simulated steps · goal {run.goal} · reserve {run.reserve} / {run.goal * 7}</p><p className="muted">Surplus stays in reserve. Story decisions always wait for you. This trial has no calendar or life penalties.</p></div><div className="actions"><button className="secondary" onClick={() => act({ type: 'steps', amount: Math.max(1, Math.ceil(run.goal * 0.02)) })}>Simulate 2% of goal</button><button className="secondary" onClick={() => act({ type: 'steps', amount: run.goal })}>Simulate one goal</button></div></section>
        <section className="journal"><p className="eyebrow">Your story so far</p><h2>The journal</h2>{run.events.some(event => event.type !== 'steps') ? <ol>{run.events.filter(event => event.type !== 'steps').map((event, i) => <li key={i}>{journalText[event.type]}</li>)}</ol> : <p>The first page is still blank.</p>}</section>
        <div className="reset">{resetting ? <><p>Replace this trial and its local journal? This does not represent the campaign’s reboot rules.</p><button onClick={() => { store(createRun(run.goal)); setResetting(false); }}>Replace trial</button> <button className="secondary" onClick={() => setResetting(false)}>Keep this trial</button></> : <button className="secondary" onClick={() => setResetting(true)}>Restart internal trial</button>}</div>
      </>}
    </main><footer>Letmoro · authored draft in English · saved only in this browser</footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
