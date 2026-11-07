import { StrictMode, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { apply, createRun } from './domain/prologue.ts';
import type { Action, Run } from './domain/prologue.ts';
import type { Profile } from './domain/profile.ts';
import { prologue, journalText } from './content/prologue.en.ts';
import { scenesFr, journalFr } from './content/prologue.fr.ts';
import { en, fr } from './content/ui.ts';
import type { Locale } from './content/ui.ts';
import { loadAccountRun, saveAccountRun, eraseAccountProgress } from './adapters/account-save.ts';
import { recordsFor } from './domain/records.ts';
import { useSteps } from './ui/useSteps.ts';
import { supportsHealth, openHealthSettings, openSamsungHealth } from './adapters/health.ts';
import { PixelIcon } from './ui/PixelIcon.tsx';
import { Setup } from './ui/Setup.tsx';
import { World } from './ui/World.tsx';
import { creditSteps } from './health/credit.ts';
import { Account } from './ui/Account.tsx';
import { useAccount } from './auth/useAccount.ts';
import { openingContent } from './content/narrative.ts';
import { QuestActions } from './ui/QuestActions.tsx';
import { LetterRecord } from './ui/LetterRecord.tsx';
import { CampaignLetters } from './ui/CampaignPanel.tsx';
import { campaignUI } from './content/campaign-ui.ts';
import { RestartGame } from './ui/RestartGame.tsx';
import { RestSettings } from './ui/RestSettings.tsx';
import { useCloudSave } from './ui/useCloudSave.ts';
import { decodeSave } from './adapters/save.ts';
import type { CloudSnapshot } from './adapters/cloud-save.ts';
import { atPlace, currentNode, questReady, remainingQuestSteps } from './domain/navigation.ts';
import type { CharacterId } from './domain/encounters.ts';
import { sceneCopy } from './content/presentation.ts';
import { HealthArrival } from './ui/HealthArrival.tsx';
import { Journal } from './ui/Journal.tsx';
import { useLifeDays } from './ui/useLifeDays.ts';
import { LifeDetails } from './ui/LifeDetails.tsx';
import {useWidget} from './ui/useWidget.ts';
import {widgetSnapshot} from './domain/widget.ts';
import { StepDiagnostics } from './ui/StepDiagnostics.tsx';
import {SkillTree} from './ui/SkillTree.tsx';
import {EncounterScreen} from './ui/EncounterScreen.tsx';
import {JourneyReminder} from './ui/JourneyReminder.tsx';
import {LanguageArrival} from './ui/LanguageArrival.tsx';
import {rememberLocale} from './adapters/locale.ts';
import './style.css';

type Page = 'menu' | 'story' | 'collection' | 'steps' | 'settings' | 'coins' | 'account' | 'skills';
type Collection = 'letters' | 'characters' | 'badges' | 'journal';
function App({launchLocale,explicitLocale}:{launchLocale:Locale;explicitLocale:boolean}) {
  const sessionLocale=useRef<Locale|null>(explicitLocale?launchLocale:null);
  const account = useAccount();
  const currentUser = useRef<string | null>(account.user?.id ?? null); currentUser.current = account.user?.id ?? null;
  const [run, setRun] = useState<Run | null>(null);
  const currentRun = useRef<Run | null>(run); currentRun.current = run;
  const [gameOwner, setGameOwner] = useState<string | null>(null);
  const currentOwner = useRef(gameOwner); currentOwner.current = gameOwner;
  const getRun = useCallback((expectedOwner?: string) => expectedOwner && (currentOwner.current !== expectedOwner || currentUser.current !== expectedOwner) ? null : currentRun.current, []);
  const health = useSteps(run?.healthLedger, Boolean(account.user) && gameOwner === account.user?.id && !account.recovery);
  const [locale, setLocale] = useState<Locale>(launchLocale);
  const [warning, setWarning] = useState<'loadError' | 'saveError' | 'settingsError' | null>(null);
  const [page, setPage] = useState<Page>('menu');
  const [collection, setCollection] = useState<Collection>('letters');
  const [skillNotice, setSkillNotice] = useState(false);
  const [healthDismissed, setHealthDismissed] = useState(false);
  const [awaitingWalk, setAwaitingWalk] = useState(false);
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
    setWalkCue(false); setSkillNotice(false); setHealthDismissed(false); setAwaitingWalk(false);
  }, [userId]);
  useEffect(() => { if (account.recovery) { setPage('account'); dialog.current?.showModal(); } }, [account.recovery]);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => { if (dialog.current?.open) dialog.current.querySelector<HTMLElement>('h1, h2')?.focus(); }, [page, collection]);
  useEffect(() => {
    if (intro === null) return;
    introFocus.current?.focus();
    if (intro !== 0) return;
    const timer = window.setTimeout(() => setIntro(1), 3600);
    return () => clearTimeout(timer);
  }, [intro]);
  const store = useCallback((next: Run) => {
    if (!userId || gameOwner !== userId || currentUser.current !== userId || currentOwner.current !== userId) return;
    currentRun.current = next; setRun(next);
    try { saveAccountRun(userId, next); setWarning(null); }
    catch { setWarning('saveError'); }
  }, [userId, gameOwner]);
  const restoreCloud = useCallback((snapshot: CloudSnapshot, ownerId: string) => {
    if (!userId || userId !== ownerId) throw new Error('Save owner changed');
    const restored = snapshot.payload === null ? null : decodeSave(snapshot.payload);
    if (restored) saveAccountRun(userId, restored); else eraseAccountProgress(userId);
    const restoredLocale=sessionLocale.current??snapshot.locale;
    rememberLocale(restoredLocale);
    currentRun.current = restored; setRun(restored); setLocale(restoredLocale); setIntro(null);
    dialog.current?.close();
  }, [userId]);
  const cloud = useCloudSave(userId, Boolean(userId && gameOwner === userId && !account.recovery && warning !== 'loadError'), run, locale, restoreCloud);
  useEffect(() => { if (account.user && gameOwner === account.user.id && !run && !dialog.current?.open) dialog.current?.showModal(); }, [account.user, run, gameOwner, cloud.status]);
  useEffect(() => {
    if (!run || !account.user || gameOwner !== userId || cloud.status === 'loading' || cloud.status === 'conflict') return;
    let next = run;
    if (!next.life.calendar) { const now = new Date().toISOString(); next = apply(next, { type: 'begin-life-accounting', startedAt: now, zone: Intl.DateTimeFormat().resolvedOptions().timeZone, at: now }); }
    next = creditSteps(next, health.snapshot);
    if (next.life.lives > 0) {
      if (intro === null && next.journeyOrigin === undefined && next.healthKey) next = apply(next, { type: 'start-journey' });
      if (intro === null && !next.navigation && (next.journeyOrigin !== undefined || next.simulatedSteps > 0 || next.stage !== 'street')) next = apply(next, { type: 'enable-navigation' });
      if (next.navigation && !next.navigation.openRetreat) next = apply(next, { type: 'extend-return-path' });
    }
    if (next !== run) store(next);
  }, [health.snapshot, run, store, intro, account.user, gameOwner, userId, cloud.status]);
  useWidget(userId && gameOwner===userId && !account.recovery ? userId : null, widgetSnapshot(run,health.snapshot,locale));
  const healthConnected = health.snapshot.status === 'ready' || health.snapshot.status === 'empty';
  const lifeHistory = useLifeDays(userId && gameOwner === userId ? userId : null, run?.life.calendar, healthConnected, getRun, store);
  useEffect(() => {
    if (healthConnected && !healthDismissed) { setHealthDismissed(true); if (awaitingWalk) { setWalkCue(true); setAwaitingWalk(false); } }
  }, [healthConnected, healthDismissed, awaitingWalk]);
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
  function finishIntro() { setIntro(null); if (currentRun.current?.life.lives === 0) return; if (healthConnected || healthDismissed) setWalkCue(true); else setAwaitingWalk(true); }
  function leaveHealthGate() { setHealthDismissed(true); if (awaitingWalk) { setWalkCue(true); setAwaitingWalk(false); } }
  function act(action: Action) { const latest = currentRun.current; if (latest && (latest.life.lives > 0 || action.type === 'life-day')) { store(apply(latest, { ...action, at: new Date().toISOString() })); if (action.type === 'accept') setSkillNotice(true); } }
  function open(page: Page) { setPage(page); dialog.current?.showModal(); }
  function begin(goal: number, profile: Profile) { setSkillNotice(false); const now = new Date().toISOString(); let fresh = createRun(goal,profile); if (userId && localStorage.getItem(`letmoro.fresh-start.v1.${userId}`)==='1') fresh=apply(fresh,{type:'fresh-start'}); store(apply(fresh, { type: 'begin-life-accounting', startedAt: now, zone: Intl.DateTimeFormat().resolvedOptions().timeZone, at: now })); if(userId)localStorage.removeItem(`letmoro.fresh-start.v1.${userId}`); dialog.current?.close(); setIntro(0); }
  function chooseLocale(value: Locale) {
    sessionLocale.current=value; setLocale(value);
    try { rememberLocale(value); } catch { setWarning('saveError'); }
  }
  const content = openingContent(locale);
  const scene = run ? (locale === 'fr' ? scenesFr : prologue.scenes)[run.stage] : null;
  const records = run ? recordsFor(run) : null;
  const sceneText = run && scene ? sceneCopy(run, scene.text, t, content) : undefined;
  const node = run?.navigation ? currentNode(run) : undefined;
  useEffect(()=>{
    if(!run||run.stage!=='campaign'||!node||['start','approach','outskirts'].includes(node)||!userId||gameOwner!==userId||run.life.lives===0||cloud.status==='loading'||cloud.status==='conflict')return;
    if(currentRun.current!==run)return;
    const odometer=run.navigation?.odometer??0;
    if(run.campaign.lastVisits?.[node]===odometer&&run.campaign.visited.includes(node))return;
    store(apply(run,{type:'visit-campaign-place',at:new Date().toISOString()}));
  },[run,node,userId,gameOwner,cloud.status,store]);
  useEffect(() => {
    if (!run || !content?.campaign || !userId || gameOwner !== userId || run.life.lives === 0 || cloud.status === 'loading' || cloud.status === 'conflict') return;
    if(currentRun.current!==run)return;
    const campaign = run.campaign, odometer = run.navigation?.odometer ?? 0;
    if(run.stage==='campaign'&&node&&!['start','approach','outskirts'].includes(node)&&(campaign.lastVisits?.[node]!==odometer||!campaign.visited.includes(node)))return;
    if (campaign.pendingThought || odometer - campaign.thoughtMark < run.goal * .5) return;
    const letters = Object.values(campaign.letters);
    const suitable = content.campaign.thoughts.filter(thought => thought.id !== campaign.lastThought && (
      thought.condition === 'always' || thought.condition === 'alone' && !campaign.friends.length || thought.condition === 'company' && campaign.friends.length > 0 || thought.condition === 'sealed' && letters.some(letter=>letter.status==='carried'&&!letter.opened) || thought.condition === 'opened' && (run.letterOpened || letters.some(letter=>letter.opened)) || thought.condition === 'cemetery' && campaign.visited.includes('cemetery')));
    const unseen=suitable.filter(thought=>!campaign.thoughts.includes(thought.id));
    const eligible=unseen.length?unseen:suitable;
    if (!unseen.length && odometer-campaign.thoughtMark < run.goal*2) return;
    if (!eligible.length) return;
    const chosen=eligible[(Math.floor(odometer/run.goal)+campaign.thoughts.length*7)%eligible.length];
    store(apply(run,{type:'capture-thought',id:chosen.id,at:new Date().toISOString()}));
  }, [run,content,userId,gameOwner,cloud.status,store]);
  const xpMemory=useRef<{owner:string|null;balance:number}|null>(null);
  const [xpNotice,setXpNotice]=useState<number|null>(null);
  useEffect(()=>{
    if(!run||!userId){xpMemory.current=null;setXpNotice(null);return;}
    const balance=run.campaign.xp??0,previous=xpMemory.current;
    if(previous?.owner===userId&&balance>previous.balance)setXpNotice(balance-previous.balance);
    xpMemory.current={owner:userId,balance};
  },[run,userId]);
  useEffect(()=>{if(xpNotice===null)return;const timer=window.setTimeout(()=>setXpNotice(null),4000);return()=>clearTimeout(timer);},[xpNotice,run?.campaign.xp]);
  const badgeMemory = useRef<{owner:string|null;ids:string[]} | null>(null);
  const [badgeNotice,setBadgeNotice]=useState<string | null>(null);
  const badgeIds=records?.badges.filter(badge=>badge.description!==null).map(badge=>badge.id) ?? [];
  useEffect(()=>{
    if (!run || !userId) { badgeMemory.current=null; setBadgeNotice(null); return; }
    const previous=badgeMemory.current;
    if (previous?.owner===userId) { const earned=badgeIds.filter(id=>!previous.ids.includes(id)); if(earned.length)setBadgeNotice(earned.at(-1)!); }
    badgeMemory.current={owner:userId,ids:badgeIds};
  },[run,userId]);
  useEffect(()=>{ if(!badgeNotice)return;const timer=window.setTimeout(()=>setBadgeNotice(null),5000);return()=>clearTimeout(timer); },[badgeNotice]);
  const pendingThought=content?.campaign?.thoughts.find(thought=>thought.id===run?.campaign.pendingThought);

  const readyChoice = Boolean(run && (run.stage === 'campaign' ? Boolean(node && !['start','approach','outskirts'].includes(node)) : (questReady(run) || (run.stage === 'errand-return' && atPlace(run, run.errand?.from === 'square' ? 'garden' : 'gate')))));
  const remaining = run ? remainingQuestSteps(run) : undefined;
  const journals = locale === 'fr' ? journalFr : journalText;
  const healthStatus = { ready: t.connected, empty: t.empty, 'permission-required': t.permission, error: t.error, unavailable: t.disconnected }[health.snapshot.status];
  const format = (value: number) => value.toLocaleString(locale);
  const language = <label className="language">{t.language}<select value={locale} onChange={event => chooseLocale(event.target.value as Locale)}><option value="fr">Français</option><option value="en">English</option></select></label>;
  if (!account.initialized) return <main className="arrival-loading"><span className="loading-square" /></main>;
  if (!account.user || account.recovery) return <main className="account-arrival"><div className="account-language">{language}</div><Account locale={locale} user={account.user} recovery={account.recovery} completeRecovery={account.completeRecovery} callbackFailed={account.failed} googleAvailable={account.googleAvailable} landing /></main>;
  if (cloud.status === 'loading' && gameOwner === userId && !run && warning !== 'loadError') return <main className="arrival-loading"><span className="loading-square" /></main>;
  if (gameOwner !== userId) return <main className="arrival-loading"><span className="loading-square" /></main>;
  if (run && intro === null && !healthDismissed && !healthConnected) return <HealthArrival text={t} snapshot={health.snapshot} initialized={health.initialized} busy={health.busy} supported={supportsHealth} connect={() => { void health.refresh(true); }} continueGame={leaveHealthGate} />;
  return <main>
    {run && <World run={run} label={`${t.world} ${node ? t.places[node] : t.onPath}`} text={t} content={content} act={act} controls={intro === null && run.life.lives > 0} choiceVisible={readyChoice} />}
    {run && intro === null && <>
      <div className="lives" role="img" aria-label={`${run.life.lives} / 3 ${t.lifeWord}`}>{Array.from({ length: 3 }, (_, index) => <i key={index} className={index >= run.life.lives ? 'lost' : undefined} />)}</div>
      <button className="xp-counter" onClick={()=>open('skills')}>{run.campaign.xp??0} XP</button>
      <button className="coin-counter" onClick={() => open('coins')} aria-label={`${run.sous} ${t.coins}`}>{format(run.sous)}<span className="step-label">{t.coins}</span></button>
      <button className="step-counter" onClick={() => open('steps')} aria-label={`${health.snapshot.count === null ? t.unknownSteps : format(health.snapshot.count)} ${t.steps}`}><span className="step-value">{health.snapshot.count === null ? '—' : format(health.snapshot.count)}</span><span className="step-label">{t.steps}</span></button>
      <button className="menu-button" aria-label={t.menu} aria-haspopup="dialog" onClick={() => open('menu')}><span aria-hidden="true" className="menu-icon" /></button>
    </>}
    {intro !== null && <section className="introduction" aria-live="polite"><div className="intro-copy"><h1 ref={introFocus} tabIndex={-1} key={intro} className={intro === 0 ? 'meet-moro' : ''}>{[t.meet, t.intro1, t.intro2, t.intro3][intro]}</h1></div><div className="intro-actions"><button onClick={() => { if (intro < 3) setIntro(intro + 1); else finishIntro(); }}>{t.next}</button><button className="back-button" onClick={finishIntro}>{t.skip}</button></div></section>}
    {run && run.life.lives > 0 && intro === null && readyChoice && !pendingThought && <EncounterScreen run={run} locale={locale} content={content}>{remaining!==undefined&&remaining>0&&<JourneyReminder run={run} locale={locale} content={content} act={act} />}{run.stage!=='campaign'&&<p aria-live="polite">{sceneText}</p>}{skillNotice && <p className="muted" role="status">{t.skillsUnlocked}</p>}<QuestActions run={run} text={t} content={content} act={act} locale={locale} /></EncounterScreen>}
    {run && run.life.lives === 0 && <aside className="run-ended" role="alert"><p>{t.lifeEnded}</p></aside>}
    {skillNotice && intro === null && !readyChoice && <p className="skill-notice" role="status">{t.skillsUnlocked}</p>}
    {run && run.life.lives > 0 && intro === null && remaining !== undefined && remaining > 0 && <JourneyReminder run={run} locale={locale} content={content} compact open={()=>open('story')} />}
    {xpNotice!==null&&intro===null&&<p className="xp-toast" role="status">+{xpNotice} XP</p>}
    {badgeNotice && intro===null && <p key={badgeNotice} className="badge-toast" role="status"><PixelIcon name="medal" />{content?.campaign?.badges[badgeNotice]?.title ?? t.badgeText[badgeNotice as keyof typeof t.badgeText]?.title}</p>}
    {pendingThought && run && intro===null && <aside className="travel-thought"><p>{pendingThought.text}</p><button onClick={()=>act({type:'dismiss-thought'})}>{campaignUI(locale).closeThought}</button></aside>}
    {walkCue && !pendingThought && !readyChoice && intro === null && <p className="walk-cue">{t.walkCue}</p>}
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
        {page === 'story' && <section className="story" aria-labelledby="scene-title"><div aria-live="polite" aria-atomic="true"><h1 id="scene-title" tabIndex={-1}>{scene!.title}</h1>{run.stage!=='campaign'&&<p className="lead">{sceneText}</p>}</div>

          {remaining!==undefined&&remaining>0&&<JourneyReminder run={run} locale={locale} content={content} act={act} />}
          <QuestActions run={run} text={t} content={content} act={act} locale={locale} />
        </section>}
        {page === 'collection' && <section><h1 tabIndex={-1}>{t.collection}</h1><nav className="collection-tabs" aria-label={t.collection}>{(['letters', 'characters', 'badges', 'journal'] as const).map(key => <button key={key} aria-current={key === collection ? 'page' : undefined} onClick={() => setCollection(key)}>{t[key]}</button>)}</nav>
          <h2>{t[collection]}</h2>{(run.campaign.xp??0)>0 && <p className="muted">{run.campaign.xp} XP</p>}
          {collection === 'letters' && <CampaignLetters run={run} locale={locale} content={content} act={act} />}
          {collection === 'letters' && records!.letters.map(letter => <LetterRecord key={letter.id} run={run} text={t} body={content?.letter} act={act} />)}
          {collection === 'characters' && <div className="character-gallery">{records!.characters.map(person => {
            const character = content?.characters[person.id as CharacterId];
            return <article key={person.id}><span className="character-square" aria-hidden="true" style={{ background: character?.color ?? '#fff' }} /><h3>{character?.name ?? (person.id === 'clerk' ? t.clerk : person.id === 'recipient' ? t.recipient : t.knownCharacter)}</h3><p>{character?.role ?? t.places[person.lastKnownPlace]}</p><p className="muted">{campaignUI(locale).trust} {run.campaign.trust[person.id]??0}{run.campaign.friends.includes(person.id) ? ` · ${campaignUI(locale).friends}` : ''}</p><p className="muted">{t.lastSeen} · {t.places[person.lastKnownPlace]}</p></article>;
          })}</div>}
          {collection === 'badges' && records!.badges.filter(badge => badge.description !== null).map(badge => <article key={badge.id}><h3 className="badge-title"><PixelIcon name="medal" />{content?.campaign?.badges[badge.id]?.title ?? t.badgeText[badge.id as keyof typeof t.badgeText]?.title ?? badge.title}</h3><p>{content?.campaign?.badges[badge.id]?.description ?? t.badgeText[badge.id as keyof typeof t.badgeText]?.description ?? ''}</p></article>)}
          {collection === 'journal' && run.campaign.thoughts.length>0 && <section><h3>{campaignUI(locale).thoughts}</h3>{[...run.campaign.thoughts].reverse().map(id=><p key={id}>{content?.campaign?.thoughts.find(thought=>thought.id===id)?.text}</p>)}{pendingThought && <button onClick={()=>act({type:'dismiss-thought'})}>{campaignUI(locale).closeThought}</button>}</section>}
          {collection === 'journal' && <Journal run={run} text={t} locale={locale} original={journals} content={content} />}
        </section>}
        {page === 'skills' && <SkillTree run={run} locale={locale} act={act} />}
        {page === 'coins' && <section><h1 tabIndex={-1}>{t.coins}</h1><p className="stat-value">{format(run.sous)}<span className="stat-unit"> {t.coins}</span></p></section>}
        {page === 'steps'  && <section><h1 tabIndex={-1}>{t.healthTitle}</h1><p className="stat-value">{health.snapshot.count === null ? '—' : format(health.snapshot.count)}<span className="stat-unit"> {t.today}</span></p><p className="status-tag">{healthStatus}</p><p>{supportsHealth ? t.healthNative : t.healthWeb}</p><p className="muted">{t.healthNote}</p>{health.snapshot.checkedAt && <p className="muted">{t.checked}: {new Date(health.snapshot.checkedAt).toLocaleTimeString(locale)}</p>}
          <StepDiagnostics snapshot={health.snapshot} locale={locale} supported={supportsHealth} openSamsung={()=>{void openSamsungHealth().catch(()=>setWarning('settingsError'));}} />{supportsHealth && <div className="actions"><button disabled={health.busy} onClick={() => { void health.refresh(true); }}>{health.snapshot.status === 'ready' && !health.snapshot.live ? t.enableLive : t.connect}</button><button disabled={health.busy} onClick={() => { void health.refresh(); }}>{t.refresh}</button><button onClick={() => { void openHealthSettings().catch(() => setWarning('settingsError')); }}>{t.manage}</button></div>}
        </section>}
        {page === 'settings' && <section><h1 tabIndex={-1}>{t.settings}</h1>{language}<RestSettings key={`${userId}:${run.life.schedules?.length??0}`} run={run} locale={locale} act={act} /><LifeDetails run={run} text={t} historyStatus={lifeHistory} /><p role="status">{t.cloudStates[cloud.status]}</p>{cloud.status === 'offline' && <button onClick={cloud.retry}>{t.retryCloud}</button>}{run.profile && <><h2>{t.difficulty}</h2><p>{t[run.profile.mode]}</p><p>{t.modeDescriptions[run.profile.mode]}</p><p className="muted">{t.modeStatusNote}</p><h2>{t.positive}</h2><p>{run.profile.positive.map(trait => t.traits[trait as keyof typeof t.traits]).join(' · ')}</p><h2>{t.negative}</h2><p>{run.profile.negative.map(trait => t.traits[trait as keyof typeof t.traits]).join(' · ')}</p></>}<div className="actions"><button onClick={() => setPage('account')}>{t.account}</button></div><RestartGame locale={locale} disabled={cloud.status==='loading'} erase={async()=>{await cloud.eraseProgress();chooseLocale('en');sessionLocale.current=null;}} /></section>}

      </>}
    </dialog>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><LanguageArrival>{(locale,explicit)=><App launchLocale={locale} explicitLocale={explicit}/>}</LanguageArrival></StrictMode>);
