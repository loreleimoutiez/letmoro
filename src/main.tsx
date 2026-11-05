import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apply, createRun, travelCost } from './domain/prologue.ts';
import type { Action, Run } from './domain/prologue.ts';
import { prologue, journalText } from './content/prologue.en.ts';
import { decodeSave, encodeSave, SAVE_KEY } from './adapters/save.ts';
import { recordsFor } from './domain/records.ts';
import { useSteps } from './ui/useSteps.ts';
import { supportsHealth, openHealthSettings } from './adapters/health.ts';
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
  const health = useSteps();
  const [loaded] = useState(initial);
  const [run, setRun] = useState(loaded.run);
  const [warning, setWarning] = useState(loaded.warning);
  const [goal, setGoal] = useState('5000');
  const [resetting, setResetting] = useState(false);
  const [page, setPage] = useState('Menu');
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const panel = dialog.current;
    if (panel) panel.querySelector<HTMLElement>('h1, h2')?.focus();
  }, [page]);
  function openMenu() { dialog.current?.showModal(); }
  function store(next: Run) {
    setRun(next);
    try { localStorage.setItem(SAVE_KEY, encodeSave(next)); setWarning(''); }
    catch { setWarning('Browser storage is unavailable or full. This trial will last only while this page stays open.'); }
  }
  function act(action: Action) { if (run) store(apply(run, action)); }
  const scene = run ? prologue.scenes[run.stage] : null;
  const traveling = run && (run.stage === 'street' || run.stage === 'delivery');
  const route = !run || run.stage === 'street' ? 0 : run?.stage === 'job' || run?.stage === 'rest' || run?.stage === 'delivery' ? 1 : 2;
  const records = run ? recordsFor(run) : null;
  return <div className="app">
    <main>
      <div className="world" role="img" aria-label={`Moro, a white square above a thin path. ${scene ? scene.place : 'An undiscovered street'}. Only traveled paths are visible.`}>
        <span className={`path route-${route}`} />
        <span className={`moro position-${route}`} />
      </div>
      <div className="lives" role="img" aria-label="3 of 3 lives. Life rules are not active in this trial."><i /><i /><i /></div>
      <button className="step-counter" aria-label={health.snapshot.count === null ? 'Steps unavailable. Open step connection.' : `${health.snapshot.count} steps today. Open step connection.`} onClick={() => { setPage('Steps'); openMenu(); }}><span className="step-value">{health.snapshot.count === null ? '—' : health.snapshot.count.toLocaleString('en')}</span><span className="step-label">steps</span></button>
      <button className="menu-button" aria-label="Open menu" aria-haspopup="dialog" onClick={() => { setPage('Menu'); openMenu(); }}><span aria-hidden="true" className="menu-icon" /></button>
      {warning && <p role="alert" className="warning">{warning}</p>}
      <dialog ref={dialog} aria-label="Menu" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="menu-head"><span className="menu-caption">/ menu</span><button className="close-button" onClick={() => dialog.current?.close()} aria-label="Close menu"><span aria-hidden="true">×</span></button></div>
        {page === 'Menu' ? <nav className="menu-list" aria-label="Trial menu">{['Story', 'Letters', 'Characters', 'Badges', 'Coins', 'Journal', 'Steps', 'Trial'].map((item, index) => <button key={item} onClick={() => setPage(item)}><span className="menu-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item}</span><span className="menu-arrow" aria-hidden="true">&gt;</span></button>)}</nav> : <button className="back-button" onClick={() => setPage('Menu')}>&lt; Menu</button>}
        {page === 'Steps' && <section className="health"><h2 tabIndex={-1}>Steps</h2><p className="stat-value">{health.snapshot.count === null ? '—' : health.snapshot.count.toLocaleString('en')}<span className="stat-unit"> today</span></p><p className="status-tag">{health.snapshot.status === 'ready' ? 'Connected · Health Connect' : health.snapshot.status === 'empty' ? 'Connected · no data yet' : health.snapshot.status === 'permission-required' ? 'Permission needed' : health.snapshot.status === 'error' ? 'Could not refresh' : 'Not connected'}</p>
          <p>{supportsHealth ? 'Read today’s steps from Health Connect. Your phone can record steps without a watch. Only step reading is requested.' : 'Real steps require the Android app. The browser cannot access Health Connect.'}</p>
          <p className="muted">Updates every 15 seconds while visible and on return. Source synchronization can be delayed. Health steps do not advance this internal trial yet.</p>
          {health.snapshot.checkedAt && <p className="muted">Last checked: {new Date(health.snapshot.checkedAt).toLocaleTimeString('en')}</p>}
          {supportsHealth && <div className="actions"><button disabled={health.busy} onClick={() => { void health.refresh(true); }}>Connect Health Connect</button><button disabled={health.busy} onClick={() => { void health.refresh(); }}>Refresh</button><button onClick={() => { void openHealthSettings().catch(() => setWarning('Health Connect settings could not be opened.')); }}>Manage access</button></div>}
        </section>}
        {!run ? <section className="onboarding"><h1 tabIndex={-1}>Begin</h1><p>Internal trial. Simulated steps only.</p><form onSubmit={event => { event.preventDefault(); const value = Number(goal); if (Number.isSafeInteger(value) && value >= 1 && value <= 100000) { store(createRun(value)); dialog.current?.close(); } }}><label htmlFor="goal">Your personal daily step goal</label><input id="goal" type="number" min="1" max="100000" step="1" required value={goal} onChange={event => setGoal(event.target.value)} /><p className="muted">Any goal is welcome. Trial journeys scale with this number; it stays fixed for this trial.</p><button type="submit">Begin the trial</button></form></section> : <>
        {page === 'Story' && <>          <section className="story" id="story" aria-labelledby="scene-title"><div aria-live="polite" aria-atomic="true"><h1 id="scene-title" tabIndex={-1}>{scene!.title}</h1><p className="lead">{scene!.text}</p><p>{scene!.detail}</p></div>
            {run.stage === 'settlement' && <dl className="receipt"><div><dt>Delivery</dt><dd>+8 coins</dd></div><div><dt>Road maintenance contribution</dt><dd>−2 coins</dd></div><div><dt>Exceptional contribution to maintaining contributions</dt><dd>−2 coins</dd></div><div><dt>Take-home pay</dt><dd>4 coins</dd></div></dl>}
            <div className="actions">
              {traveling && <><p>{travelCost(run)} simulated steps needed · {run.reserve} in reserve</p><progress aria-label="Journey steps available" value={Math.min(run.reserve, travelCost(run))} max={travelCost(run)} /><button disabled={run.reserve < travelCost(run)} onClick={() => act({ type: run.stage === 'street' ? 'cross' : 'arrive' })}>{run.stage === 'street' ? 'Cross the fictional street' : 'Enter the courtyard'}</button></>}
              {run.stage === 'job' && <><button onClick={() => act({ type: 'accept' })}>Accept the letter</button><button className="secondary" onClick={() => act({ type: 'rest' })}>Take a moment outside</button></>}
              {run.stage === 'handover' && <button onClick={() => act({ type: 'deliver' })}>Hand over the sealed letter</button>}
              {run.stage === 'settlement' && <button onClick={() => act({ type: 'settle' })}>Collect the payment</button>}
              {(run.stage === 'complete' || run.stage === 'rest') && <p className="notice">End of this internal draft. The full campaign, Android application, and health integration are still to come.</p>}
            </div>
          </section>
</>}
        {page === 'Letters' && <section><h2 tabIndex={-1}>Letters</h2>{records!.letters.map(letter => <article key={letter.id}><h3>{letter.title}</h3><p className="status-tag">{letter.status}</p><p className="muted">{letter.opened ? 'Opened' : 'Unopened'}</p></article>)}</section>}
        {page === 'Characters' && <section><h2 tabIndex={-1}>Characters</h2>{records!.characters.map(person => <article key={person.id}><h3>{person.name}</h3><p>{person.lastKnownPlace}</p></article>)}</section>}
        {page === 'Badges' && <section><h2 tabIndex={-1}>Badges</h2>{records!.badges.map(badge => <article key={badge.id}><h3>{badge.title}</h3>{badge.description && <p>{badge.description}</p>}</article>)}</section>}
        {page === 'Coins' && <section><h2 tabIndex={-1}>Coins</h2><p className="stat-value">{run.sous}<span className="stat-unit"> coins</span></p></section>}
        {page === 'Journal' && <section><h2 tabIndex={-1}>Journal</h2><ol>{run.events.filter(event => event.type !== 'steps').map((event, i) => <li key={i}>{journalText[event.type]}</li>)}</ol></section>}
        {page === 'Trial' && <section><h2 tabIndex={-1}>Internal trial</h2>        <section className="simulation" aria-labelledby="simulation-title"><div><h2 id="simulation-title">Walking simulator</h2><p>{run.simulatedSteps} simulated steps · goal {run.goal} · reserve {run.reserve} / {run.goal * 7}</p><p className="muted">Surplus stays in reserve. Story decisions always wait for you. This trial has no calendar or life penalties.</p></div><div className="actions"><button className="secondary" onClick={() => act({ type: 'steps', amount: Math.max(1, Math.ceil(run.goal * 0.02)) })}>Simulate 2% of goal</button><button className="secondary" onClick={() => act({ type: 'steps', amount: run.goal })}>Simulate one goal</button></div></section>
        <div className="reset">{resetting ? <><p>Replace this trial and its local journal? This does not represent the campaign’s reboot rules.</p><button onClick={() => { store(createRun(run.goal)); setResetting(false); }}>Replace trial</button> <button className="secondary" onClick={() => setResetting(false)}>Keep this trial</button></> : <button className="secondary" onClick={() => setResetting(true)}>Restart internal trial</button>}</div></section>}
        </>}
      </dialog>
    </main>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
