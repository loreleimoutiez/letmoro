import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apply, createRun } from './domain/prologue.ts';
import type { Action, Run } from './domain/prologue.ts';
import type { Profile } from './domain/profile.ts';
import { prologue, journalText } from './content/prologue.en.ts';
import { scenesFr, journalFr } from './content/prologue.fr.ts';
import { en, fr } from './content/ui.ts';
import type { Locale } from './content/ui.ts';
import { loadAccountRun, saveAccountRun, resetAccountRun } from './adapters/account-save.ts';
import { recordsFor } from './domain/records.ts';
import { useSteps } from './ui/useSteps.ts';
import { supportsHealth, openHealthSettings } from './adapters/health.ts';
import { PixelIcon } from './ui/PixelIcon.tsx';
import { Setup } from './ui/Setup.tsx';
import { World } from './ui/World.tsx';
import { creditSteps } from './health/credit.ts';
import { Account } from './ui/Account.tsx';
import { useAccount } from './auth/useAccount.ts';
import { openingContent } from './content/narrative.ts';
import { QuestActions } from './ui/QuestActions.tsx';
import { LetterRecord } from './ui/LetterRecord.tsx';
import { TestToolbar, internalTools } from './ui/TestToolbar.tsx';
import { useCloudSave } from './ui/useCloudSave.ts';
import { decodeSave } from './adapters/save.ts';
import type { CloudSnapshot } from './adapters/cloud-save.ts';
import { atPlace, currentNode, questReady } from './domain/navigation.ts';
import type { CharacterId } from './domain/encounters.ts';
import { journalCopy, sceneCopy } from './content/presentation.ts';
import './style.css';

function initialLocale(): Locale {
  try { const stored = localStorage.getItem('letmoro.locale.v1'); if (stored === 'fr' || stored === 'en') return stored; } catch { /* Locale can stay in memory. */ }
  return 'en';
}
type Page = 'menu' | 'story' | 'collection' | 'steps' | 'settings' | 'coins' | 'account' | 'skills';
type Collection = 'letters' | 'characters' | 'badges' | 'journal';
function App() {
  const account = useAccount();
  const [run, setRun] = useState<Run | null>(null);
  const [gameOwner, setGameOwner] = useState<string | null>(null);
  const health = useSteps(run?.healthLedger, Boolean(account.user) && gameOwner === account.user?.id && !account.recovery);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [warning, setWarning] = useState<'loadError' | 'saveError' | 'settingsError' | null>(null);
  const [page, setPage] = useState<Page>('menu');
  const [collection, setCollection] = useState<Collection>('letters');
  const [skillNotice, setSkillNotice] = useState(false);
  const [walkCue, setWalkCue] = useState(false);
  const [intro, setIntro] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const introFocus = useRef<HTMLHeadingElement>(null);
  const t = locale === 'fr' ? fr : en;
  const userId = account.user?.id ?? null;
  useEffect(() => {
    if (!userId) { setRun(null); setGameOwner(null); return; }
    try { setRun(loadAccountRun(userId)); setWarning(null); }
    catch { setRun(null); setWarning('loadError'); }
    setGameOwner(userId);
    setPage('menu');
    setIntro(null);
    setWalkCue(false); setSkillNotice(false);
  }, [userId]);
  useEffect(() => { if (account.recovery) { setPage('account'); dialog.current?.showModal(); } }, [account.recovery]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { if (account.user && gameOwner === account.user.id && !run && !dialog.current?.open) dialog.current?.showModal(); }, [account.user, run, gameOwner]);
  useEffect(() => { if (dialog.current?.open) dialog.current.querySelector<HTMLElement>('h1, h2')?.focus(); }, [page, collection]);
  useEffect(() => {
    if (intro === null) return;
    introFocus.current?.focus();
    if (intro !== 0) return;
    const timer = window.setTimeout(() => setIntro(1), 3600);
    return () => clearTimeout(timer);
  }, [intro]);
  const store = useCallback((next: Run) => {
    if (!userId || gameOwner !== userId) return;
    setRun(next);
    try { saveAccountRun(userId, next); setWarning(null); }
    catch { setWarning('saveError'); }
  }, [userId, gameOwner]);
  const restoreCloud = useCallback((snapshot: CloudSnapshot, ownerId: string) => {
    if (!userId || userId !== ownerId) throw new Error('Save owner changed');
    const restored = snapshot.payload === null ? null : decodeSave(snapshot.payload);
    if (restored) saveAccountRun(userId, restored); else resetAccountRun(userId);
    localStorage.setItem('letmoro.locale.v1', snapshot.locale);
    setRun(restored); setLocale(snapshot.locale); setIntro(null);
    dialog.current?.close();
  }, [userId]);
  const cloud = useCloudSave(userId, Boolean(userId && gameOwner === userId && !account.recovery && warning !== 'loadError'), run, locale, restoreCloud);
  useEffect(() => {
    if (!run || !account.user || gameOwner !== userId || cloud.status === 'loading' || cloud.status === 'conflict') return;
    const next = creditSteps(run, health.snapshot);
    if (next !== run) store(next);
    else if (intro === null && run.journeyOrigin === undefined && run.healthKey) store(apply(run, { type: 'start-journey' }));
  }, [health.snapshot, run, store, intro, account.user, gameOwner, userId, cloud.status]);
  useEffect(() => {
    if (run && intro === null && !run.navigation && (run.journeyOrigin !== undefined || run.simulatedSteps > 0 || run.stage !== 'street')) store(apply(run, { type: 'enable-navigation' }));
  }, [run, intro, store]);
  useEffect(() => {
    if (!skillNotice) return;
    const timer = window.setTimeout(() => setSkillNotice(false), 7000);
    return () => clearTimeout(timer);
  }, [skillNotice]);
  useEffect(() => {
    if (!walkCue) return;
    const timer = window.setTimeout(() => setWalkCue(false), 7000);
    return () => clearTimeout(timer);
  }, [walkCue]);
  useEffect(() => { if (run && run.reserve > 0) setWalkCue(false); }, [run]);
  function finishIntro() { setIntro(null); setWalkCue(true); }
  function act(action: Action) { if (run) { store(apply(run, action)); if (action.type === 'accept') setSkillNotice(true); } }
  function open(page: Page) { setPage(page); dialog.current?.showModal(); }
  function restart() {
    try { localStorage.setItem(`letmoro.cloud.v1.${account.user!.id}.reset`, '1'); resetAccountRun(account.user!.id); } catch { setWarning('saveError'); return; }
    setRun(null); setIntro(null); setSkillNotice(false); setPage('menu');
  }
  function begin(goal: number, profile: Profile) { setSkillNotice(false); store(createRun(goal, profile)); dialog.current?.close(); setIntro(0); }
  function chooseLocale(value: Locale) {
    setLocale(value);
    try { localStorage.setItem('letmoro.locale.v1', value); } catch { setWarning('saveError'); }
  }
  const content = openingContent(locale);
  const scene = run ? (locale === 'fr' ? scenesFr : prologue.scenes)[run.stage] : null;
  const records = run ? recordsFor(run) : null;
  const sceneText = run && scene ? sceneCopy(run, scene.text, t, content) : undefined;
  const node = run?.navigation ? currentNode(run) : undefined;
  const readyChoice = Boolean(run && (questReady(run) || (run.stage === 'errand-return' && atPlace(run, run.errand?.from === 'square' ? 'garden' : 'gate'))));
  const journals = locale === 'fr' ? journalFr : journalText;
  const healthStatus = { ready: t.connected, empty: t.empty, 'permission-required': t.permission, error: t.error, unavailable: t.disconnected }[health.snapshot.status];
  const format = (value: number) => value.toLocaleString(locale);
  const language = <label className="language">{t.language}<select value={locale} onChange={event => chooseLocale(event.target.value as Locale)}><option value="fr">Français</option><option value="en">English</option></select></label>;
  if (!account.initialized) return <main className="arrival-loading"><span className="loading-square" /></main>;
  if (!account.user || account.recovery) return <main className="account-arrival"><Account locale={locale} user={account.user} recovery={account.recovery} completeRecovery={account.completeRecovery} callbackFailed={account.failed} googleAvailable={account.googleAvailable} landing /></main>;
  if (cloud.status === 'loading' && gameOwner === userId && !run && warning !== 'loadError') return <main className="arrival-loading"><span className="loading-square" /></main>;
  if (gameOwner !== userId) return <main className="arrival-loading"><span className="loading-square" /></main>;
  return <main className={internalTools ? 'internal-preview' : undefined}>
    {run && <World run={run} label={`${t.world} ${node ? t.places[node] : t.onPath}`} text={t} content={content} act={act} controls={intro === null} choiceVisible={readyChoice} />}
    {run && intro === null && <>
      <div className="lives" role="img" aria-label={t.lives}><i /><i /><i /></div>
      {!internalTools && <button className="coin-counter" onClick={() => open('coins')} aria-label={`${run.sous} ${t.coins}`}>{format(run.sous)}<span className="step-label">{t.coins}</span></button>}
      {!internalTools && <button className="step-counter" onClick={() => open('steps')} aria-label={`${health.snapshot.count === null ? t.unknownSteps : format(health.snapshot.count)} ${t.steps}`}><span className="step-value">{health.snapshot.count === null ? '—' : format(health.snapshot.count)}</span><span className="step-label">{t.steps}</span></button>}
      <button className="menu-button" aria-label={t.menu} aria-haspopup="dialog" onClick={() => open('menu')}><span aria-hidden="true" className="menu-icon" /></button>
    </>}
    {intro !== null && <section className="introduction" aria-live="polite"><div className="intro-copy"><h1 ref={introFocus} tabIndex={-1} key={intro} className={intro === 0 ? 'meet-moro' : ''}>{[t.meet, t.intro1, t.intro2, t.intro3][intro]}</h1></div><div className="intro-actions"><button onClick={() => { if (intro < 3) setIntro(intro + 1); else finishIntro(); }}>{t.next}</button><button className="back-button" onClick={finishIntro}>{t.skip}</button></div></section>}
    {run && intro === null && readyChoice && <section className="world-choice" aria-label={t.story}><p aria-live="polite">{sceneText}</p>{skillNotice && <p className="muted" role="status">{t.skillsUnlocked}</p>}<QuestActions run={run} text={t} content={content} act={act} locale={locale} /></section>}
    {skillNotice && intro === null && !readyChoice && <p className="skill-notice" role="status">{t.skillsUnlocked}</p>}
    {walkCue && !readyChoice && intro === null && <p className="walk-cue">{t.walkCue}</p>}
    {run && intro === null && internalTools && <TestToolbar run={run} text={t} count={health.snapshot.count} act={act} restart={restart} intro={() => setIntro(0)} />}
    {cloud.status === 'conflict' && <aside className="cloud-conflict" role="alert"><p>{t.cloudConflict}</p><button onClick={() => { void cloud.resolve(true); }}>{t.keepDevice}</button><button onClick={() => { void cloud.resolve(false); }}>{t.keepCloud}</button></aside>}
    {warning && <p role="alert" className="warning">{t[warning]}</p>}
    <dialog ref={dialog} aria-label={t.menu} onClick={event => { if (event.target === event.currentTarget && run) dialog.current?.close(); }}>
      <div className="menu-head">{page !== 'menu' && (run || page === 'account') ? <button className="back-button" onClick={() => setPage('menu')}><PixelIcon name="back" />{t.back}</button> : <span />}{run && <button className="close-button" onClick={() => dialog.current?.close()} aria-label={t.close}><span aria-hidden="true">×</span></button>}</div>
      {page === 'account' ? <Account locale={locale} user={account.user} recovery={account.recovery} completeRecovery={account.completeRecovery} callbackFailed={account.failed} googleAvailable={account.googleAvailable} /> : !run ? <>{language}<Setup text={t} start={begin} /></> : <>
        {page === 'menu' && <nav className="menu-list" aria-label={t.menu}>
          <button onClick={() => setPage('story')}><PixelIcon name="story" />{t.story}<span aria-hidden="true">&gt;</span></button>
          <button onClick={() => setPage('collection')}><PixelIcon name="collection" />{t.collection}<span aria-hidden="true">&gt;</span></button>
          {records!.skills.length > 0 && <button onClick={() => setPage('skills')}><PixelIcon name="collection" />{t.skills}<span aria-hidden="true">&gt;</span></button>}
          <button onClick={() => setPage('steps')}><PixelIcon name="steps" />{t.healthTitle}<span aria-hidden="true">&gt;</span></button>
          <button className="settings-entry" onClick={() => setPage('settings')}><PixelIcon name="settings" />{t.settings}<span aria-hidden="true">&gt;</span></button>
        </nav>}
        {page === 'story' && <section className="story" aria-labelledby="scene-title"><div aria-live="polite" aria-atomic="true"><h1 id="scene-title" tabIndex={-1}>{scene!.title}</h1><p className="lead">{sceneText}</p><p>{run.letterOpened || run.letterDestroyed ? '' : scene!.detail}</p></div>

          <QuestActions run={run} text={t} content={content} act={act} locale={locale} />
        </section>}
        {page === 'collection' && <section><h1 tabIndex={-1}>{t.collection}</h1><nav className="collection-tabs" aria-label={t.collection}>{(['letters', 'characters', 'badges', 'journal'] as const).map(key => <button key={key} aria-current={key === collection ? 'page' : undefined} onClick={() => setCollection(key)}>{t[key]}</button>)}</nav>
          <h2>{t[collection]}</h2>
          {collection === 'letters' && records!.letters.map(letter => <LetterRecord key={letter.id} run={run} text={t} body={content?.letter} act={act} />)}
          {collection === 'characters' && <div className="character-gallery">{records!.characters.map(person => {
            const character = content?.characters[person.id as CharacterId];
            return <article key={person.id}><span className="character-square" aria-hidden="true" style={{ background: character?.color ?? '#fff' }} /><h3>{character?.name ?? (person.id === 'clerk' ? t.clerk : person.id === 'recipient' ? t.recipient : t.knownCharacter)}</h3><p>{character?.role ?? t.places[person.lastKnownPlace]}</p><p className="muted">{t.lastSeen} · {t.places[person.lastKnownPlace]}</p></article>;
          })}</div>}
          {collection === 'badges' && records!.badges.filter(badge => badge.description !== null).map(badge => <article key={badge.id}><h3 className="badge-title"><PixelIcon name="medal" />{t.badgeText[badge.id as keyof typeof t.badgeText].title}</h3><p>{t.badgeText[badge.id as keyof typeof t.badgeText].description}</p></article>)}
          {collection === 'journal' && <ol>{run.events.filter(event => event.type !== 'steps' && event.type !== 'health-sync' && event.type !== 'start-journey' && event.type !== 'test-coins' && event.type !== 'enable-navigation').map((event, index) => <li key={index}>{journalCopy(event, t, journals, content)}{event.type === 'accept' && <p>{t.skillsUnlocked}</p>}</li>)}</ol>}
        </section>}
        {page === 'skills' && records!.skills.length > 0 && <section><h1 tabIndex={-1}>{t.skills}</h1><p>{t.skillsUnlocked}</p><div className="skill-root"><span aria-hidden="true" /><h2>{t.basicRespect}</h2><p>{t.basicRespectDescription}</p></div></section>}
        {page === 'coins' && <section><h1 tabIndex={-1}>{t.coins}</h1><p className="stat-value">{format(run.sous)}<span className="stat-unit"> {t.coins}</span></p></section>}
        {page === 'steps'  && <section><h1 tabIndex={-1}>{t.healthTitle}</h1><p className="stat-value">{health.snapshot.count === null ? '—' : format(health.snapshot.count)}<span className="stat-unit"> {t.today}</span></p><p className="status-tag">{healthStatus}</p><p>{supportsHealth ? t.healthNative : t.healthWeb}</p><p className="muted">{t.healthNote}</p>{health.snapshot.checkedAt && <p className="muted">{t.checked}: {new Date(health.snapshot.checkedAt).toLocaleTimeString(locale)}</p>}
          {supportsHealth && <div className="actions"><button disabled={health.busy} onClick={() => { void health.refresh(true); }}>{health.snapshot.status === 'ready' && !health.snapshot.live ? t.enableLive : t.connect}</button><button disabled={health.busy} onClick={() => { void health.refresh(); }}>{t.refresh}</button><button onClick={() => { void openHealthSettings().catch(() => setWarning('settingsError')); }}>{t.manage}</button></div>}
        </section>}
        {page === 'settings' && <section><h1 tabIndex={-1}>{t.settings}</h1>{language}<p role="status">{t.cloudStates[cloud.status]}</p>{cloud.status === 'offline' && <button onClick={cloud.retry}>{t.retryCloud}</button>}{run.profile && <><h2>{t.difficulty}</h2><p>{t[run.profile.mode]}</p><p>{t.modeDescriptions[run.profile.mode]}</p><p className="muted">{t.modeStatusNote}</p><h2>{t.positive}</h2><p>{run.profile.positive.map(trait => t.traits[trait as keyof typeof t.traits]).join(' · ')}</p><h2>{t.negative}</h2><p>{run.profile.negative.map(trait => t.traits[trait as keyof typeof t.traits]).join(' · ')}</p></>}<div className="actions"><button onClick={() => setPage('account')}>{t.account}</button></div></section>}

      </>}
    </dialog>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
