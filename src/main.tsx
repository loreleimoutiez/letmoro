import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apply, createRun, travelCost } from './domain/prologue.ts';
import type { Action, Run } from './domain/prologue.ts';
import type { Profile } from './domain/profile.ts';
import { prologue, journalText } from './content/prologue.en.ts';
import { scenesFr, journalFr } from './content/prologue.fr.ts';
import { en, fr } from './content/ui.ts';
import type { Locale } from './content/ui.ts';
import { decodeSave, encodeSave, SAVE_KEY } from './adapters/save.ts';
import { recordsFor } from './domain/records.ts';
import { useSteps } from './ui/useSteps.ts';
import { supportsHealth, openHealthSettings } from './adapters/health.ts';
import { PixelIcon } from './ui/PixelIcon.tsx';
import { Setup } from './ui/Setup.tsx';
import { World } from './ui/World.tsx';
import { observeSteps } from './health/credit.ts';
import type { StepCursor } from './health/credit.ts';
import './style.css';

function initial(): { run: Run | null; unreadable: boolean } {
  try { const raw = localStorage.getItem(SAVE_KEY); return { run: raw ? decodeSave(raw) : null, unreadable: false }; }
  catch { return { run: null, unreadable: true }; }
}
function initialLocale(): Locale {
  try { const stored = localStorage.getItem('letmoro.locale.v1'); if (stored === 'fr' || stored === 'en') return stored; } catch { /* Locale can stay in memory. */ }
  return navigator.language.startsWith('fr') ? 'fr' : 'en';
}
type Page = 'menu' | 'story' | 'collection' | 'steps' | 'settings' | 'trial' | 'coins';
type Collection = 'letters' | 'characters' | 'badges' | 'journal';
function App() {
  const health = useSteps();
  const creditCursor = useRef<StepCursor | null>(null);
  const [loaded] = useState(initial);
  const [run, setRun] = useState(loaded.run);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [warning, setWarning] = useState<'loadError' | 'saveError' | 'settingsError' | null>(loaded.unreadable ? 'loadError' : null);
  const [resetting, setResetting] = useState(false);
  const [page, setPage] = useState<Page>('menu');
  const [collection, setCollection] = useState<Collection>('letters');
  const [intro, setIntro] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const introFocus = useRef<HTMLHeadingElement>(null);
  const t = locale === 'fr' ? fr : en;
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { if (!loaded.run) dialog.current?.showModal(); }, [loaded]);
  useEffect(() => { if (dialog.current?.open) dialog.current.querySelector<HTMLElement>('h1, h2')?.focus(); }, [page, collection]);
  useEffect(() => {
    if (intro === null) return;
    introFocus.current?.focus();
    if (intro !== 0) return;
    const timer = window.setTimeout(() => setIntro(1), 3600);
    return () => clearTimeout(timer);
  }, [intro]);
  const store = useCallback((next: Run) => {
    setRun(next);
    try { localStorage.setItem(SAVE_KEY, encodeSave(next)); setWarning(null); }
    catch { setWarning('saveError'); }
  }, []);
  useEffect(() => {
    if (!run) { creditCursor.current = null; return; }
    const credit = observeSteps(creditCursor.current, health.snapshot);
    creditCursor.current = credit.cursor;
    if (credit.amount > 0) store(apply(run, { type: 'steps', amount: credit.amount, source: 'health' }));
    // Session cursor is independent of narrative choices and is never serialized.
  }, [health.snapshot, run, store]);
  function act(action: Action) { if (run) store(apply(run, action)); }
  function open(page: Page) { setPage(page); dialog.current?.showModal(); }
  function begin(goal: number, profile: Profile) { store(createRun(goal, profile)); dialog.current?.close(); setIntro(0); }
  function chooseLocale(value: Locale) {
    setLocale(value);
    try { localStorage.setItem('letmoro.locale.v1', value); } catch { setWarning('saveError'); }
  }
  const scene = run ? (locale === 'fr' ? scenesFr : prologue.scenes)[run.stage] : null;
  const records = run ? recordsFor(run) : null;
  const traveling = run && (run.stage === 'street' || run.stage === 'delivery');
  const journals = locale === 'fr' ? journalFr : journalText;
  const healthStatus = { ready: t.connected, empty: t.empty, 'permission-required': t.permission, error: t.error, unavailable: t.disconnected }[health.snapshot.status];
  const format = (value: number) => value.toLocaleString(locale);
  const language = <label className="language">{t.language}<select value={locale} onChange={event => chooseLocale(event.target.value as Locale)}><option value="fr">Français</option><option value="en">English</option></select></label>;
  return <main>
    {run && <World run={run} label={`${t.world} ${scene!.place}`} />}
    {run && intro === null && <>
      <div className="lives" role="img" aria-label={t.lives}><i /><i /><i /></div>
      <button className="coin-counter" onClick={() => open('coins')} aria-label={`${run.sous} ${t.coins}`}><span className="coin-pixel" aria-hidden="true" />{format(run.sous)}<span className="step-label">{t.coins}</span></button>
      <button className="step-counter" onClick={() => open('steps')} aria-label={`${health.snapshot.count === null ? t.unknownSteps : format(health.snapshot.count)} ${t.steps}`}><span className="step-value">{health.snapshot.count === null ? '—' : format(health.snapshot.count)}</span><span className="step-label">{t.steps}</span></button>
      <button className="menu-button" aria-label={t.menu} aria-haspopup="dialog" onClick={() => open('menu')}><span aria-hidden="true" className="menu-icon" /></button>
    </>}
    {intro !== null && <section className="introduction" aria-live="polite"><h1 ref={introFocus} tabIndex={-1} key={intro} className={intro === 0 ? 'meet-moro' : ''}>{[t.meet, t.intro1, t.intro2][intro]}</h1><div className="intro-actions"><button onClick={() => setIntro(intro < 2 ? intro + 1 : null)}>{t.next}</button><button className="back-button" onClick={() => setIntro(null)}>{t.skip}</button></div></section>}
    {warning && <p role="alert" className="warning">{t[warning]}</p>}
    <dialog ref={dialog} aria-label={t.menu} onClick={event => { if (event.target === event.currentTarget && run) dialog.current?.close(); }}>
      <div className="menu-head">{page !== 'menu' && run ? <button className="back-button" onClick={() => setPage('menu')}><PixelIcon name="back" />{t.back}</button> : <span />}{run && <button className="close-button" onClick={() => dialog.current?.close()} aria-label={t.close}><span aria-hidden="true">×</span></button>}</div>
      {!run ? <>{language}<Setup text={t} start={begin} /></> : <>
        {page === 'menu' && <nav className="menu-list" aria-label={t.menu}>
          <button onClick={() => setPage('story')}><PixelIcon name="story" />{t.story}<span aria-hidden="true">&gt;</span></button>
          <button onClick={() => setPage('collection')}><PixelIcon name="collection" />{t.collection}<span aria-hidden="true">&gt;</span></button>
          <button onClick={() => setPage('steps')}><PixelIcon name="steps" />{t.healthTitle}<span aria-hidden="true">&gt;</span></button>
          <button className="settings-entry" onClick={() => setPage('settings')}><PixelIcon name="settings" />{t.settings}<span aria-hidden="true">&gt;</span></button>
        </nav>}
        {page === 'story' && <section className="story" aria-labelledby="scene-title"><div aria-live="polite" aria-atomic="true"><h1 id="scene-title" tabIndex={-1}>{scene!.title}</h1><p className="lead">{scene!.text}</p><p>{scene!.detail}</p></div>
          {run.stage === 'settlement' && <dl className="receipt">{[[t.deliveryPay, '+8'], [t.deduction1, '−2'], [t.deduction2, '−2'], [t.net, '4']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value} {t.coins}</dd></div>)}</dl>}
          <div className="actions">{traveling && <><p>{t.needed}: {format(travelCost(run))} · {t.reserve}: {format(run.reserve)}</p><progress aria-label={t.reserve} value={Math.min(run.reserve, travelCost(run))} max={travelCost(run)} /><button disabled={run.reserve < travelCost(run)} onClick={() => act({ type: run.stage === 'street' ? 'cross' : 'arrive' })}>{run.stage === 'street' ? t.cross : t.arrive}</button></>}
            {run.stage === 'job' && <><button onClick={() => act({ type: 'accept' })}>{t.accept}</button><button onClick={() => act({ type: 'rest' })}>{t.rest}</button></>}
            {run.stage === 'handover' && <button onClick={() => act({ type: 'deliver' })}>{t.deliver}</button>}
            {run.stage === 'settlement' && <button onClick={() => act({ type: 'settle' })}>{t.settle}</button>}
            {(run.stage === 'complete' || run.stage === 'rest') && <p className="muted">{t.end}</p>}
          </div>
        </section>}
        {page === 'collection' && <section><h1 tabIndex={-1}>{t.collection}</h1><nav className="collection-tabs" aria-label={t.collection}>{(['letters', 'characters', 'badges', 'journal'] as const).map(key => <button key={key} aria-current={key === collection ? 'page' : undefined} onClick={() => setCollection(key)}>{t[key]}</button>)}</nav>
          <h2>{t[collection]}</h2>
          {collection === 'letters' && records!.letters.map(letter => <article key={letter.id}><h3>{t.courtyardLetter}</h3><p className="status-tag">{run.delivered ? t.intact : t.carried}</p><p className="muted">{t.unopened}</p></article>)}
          {collection === 'characters' && records!.characters.map(person => <article key={person.id}><h3>{person.id === 'clerk' ? t.clerk : t.recipient}</h3><p>{person.id === 'clerk' ? t.office : t.courtyard}</p></article>)}
          {collection === 'badges' && records!.badges.map(badge => <article key={badge.id}><h3>{badge.description ? t.firstJob : t.secret}</h3>{badge.description && <p>{t.badgeDescription}</p>}</article>)}
          {collection === 'journal' && <ol>{run.events.filter(event => event.type !== 'steps').map((event, index) => <li key={index}>{journals[event.type]}</li>)}</ol>}
        </section>}
        {page === 'coins' && <section><h1 tabIndex={-1}>{t.coins}</h1><p className="stat-value">{format(run.sous)}<span className="stat-unit"> {t.coins}</span></p></section>}
        {page === 'steps'  && <section><h1 tabIndex={-1}>{t.healthTitle}</h1><p className="stat-value">{health.snapshot.count === null ? '—' : format(health.snapshot.count)}<span className="stat-unit"> {t.today}</span></p><p className="status-tag">{healthStatus}</p><p>{supportsHealth ? t.healthNative : t.healthWeb}</p><p className="muted">{t.healthNote}</p>{health.snapshot.checkedAt && <p className="muted">{t.checked}: {new Date(health.snapshot.checkedAt).toLocaleTimeString(locale)}</p>}
          {supportsHealth && <div className="actions"><button disabled={health.busy} onClick={() => { void health.refresh(true); }}>{t.connect}</button><button disabled={health.busy} onClick={() => { void health.refresh(); }}>{t.refresh}</button><button onClick={() => { void openHealthSettings().catch(() => setWarning('settingsError')); }}>{t.manage}</button></div>}
        </section>}
        {page === 'settings' && <section><h1 tabIndex={-1}>{t.settings}</h1>{language}{run.profile && <><h2>{t.difficulty}</h2><p>{t[run.profile.mode]}</p><h2>{t.positive}</h2><p>{run.profile.positive.map(trait => t.traits[trait as keyof typeof t.traits]).join(' · ')}</p><h2>{t.negative}</h2><p>{run.profile.negative.map(trait => t.traits[trait as keyof typeof t.traits]).join(' · ')}</p></>}<button onClick={() => setPage('trial')}>{t.trial}</button></section>}
        {page === 'trial' && <section><h1 tabIndex={-1}>{t.trial}</h1><p>{format(run.simulatedSteps)} {t.steps} {t.simulated} · {t.reserve}: {format(run.reserve)}</p><div className="actions">{import.meta.env.DEV && !supportsHealth && <><button onClick={() => act({ type: 'steps', amount: Math.max(1, Math.ceil(run.goal * .002)) })}>{t.simulate} +{Math.max(1, Math.ceil(run.goal * .002))}</button><button onClick={() => act({ type: 'steps', amount: run.goal })}>{t.simulateGoal}</button></>}</div>
          {resetting ? <><p>{t.confirm}</p><button onClick={() => { store(createRun(run.goal, run.profile)); setResetting(false); }}>{t.replace}</button><button onClick={() => setResetting(false)}>{t.keep}</button></> : <button onClick={() => setResetting(true)}>{t.restart}</button>}
        </section>}
      </>}
    </dialog>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
