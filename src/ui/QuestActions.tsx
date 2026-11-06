import type { Action, Run } from '../domain/prologue.ts';
import { atPlace, currentLeg, questReady } from '../domain/navigation.ts';
import type { Neighborhood } from '../domain/navigation.ts';
import type { en } from '../content/ui.ts';
import type { OpeningContent, Topic } from '../content/narrative.ts';
import { DialogueChoices } from './DialogueChoices.tsx';

export function QuestActions({ run, text: t, content, act, locale }: {
  run: Run; text: typeof en; content?: OpeningContent; act: (action: Action) => void; locale: string;
}) {
  const lastTopic = run.discussed.at(-1), ready = questReady(run), leg = currentLeg(run);
  const traveling = ['street', 'delivery', 'errand', 'errand-return'].includes(run.stage) || (run.stage === 'neighborhood' && run.destination);
  const progress = <p className="quest-progress">{Math.min(leg.current, leg.required).toLocaleString(locale)} / {leg.required.toLocaleString(locale)} {t.steps}</p>;
  const initialJobChoices = <><button onClick={() => act({ type: 'accept' })}>{t.accept}</button><button onClick={() => act({ type: 'rest' })}>{t.rest}</button></>;
  const place = run.stage as Neighborhood, visit = content?.visits?.[place];
  return <div className="actions">
    {traveling && progress}
    {['street', 'delivery'].includes(run.stage) && <button disabled={!ready} onClick={() => act({ type: run.stage === 'street' ? 'cross' : 'arrive' })}>{run.stage === 'street' ? t.cross : t.arrive}</button>}
    {run.stage === 'job' && atPlace(run, 'office') && (content ? <DialogueChoices key="job" label={t.askQuestions} back={t.backToChoices} initial={initialJobChoices}>
      {lastTopic && <p role="status">{content.topics[lastTopic].answer}</p>}{(Object.keys(content.topics) as Topic[]).filter(topic => !run.discussed.includes(topic)).map(topic => <button key={topic} onClick={() => act({ type: 'ask', topic })}>{content.topics[topic].question}</button>)}
    </DialogueChoices> : initialJobChoices)}
    {run.stage === 'rest' && atPlace(run, 'office') && <><button onClick={() => act({ type: 'reconsider' })}>{t.reconsider}</button>{run.navigation && content?.visits && <button onClick={() => act({ type: 'explore-neighborhood' })}>{t.exploreNeighborhood}</button>}</>}
    {run.stage === 'handover' && ready && <button onClick={() => act({ type: run.letterDestroyed ? 'report-loss' : 'deliver' })}>{run.letterDestroyed ? t.reportLoss : run.letterOpened ? t.deliverOpened : t.deliver}</button>}
    {run.stage === 'settlement' && ready && <><dl className="receipt">{[[t.deliveryPay, '+8'], [t.deduction1, '−2'], [t.deduction2, '−2'], [t.net, '4']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value} {t.coins}</dd></div>)}</dl><button onClick={() => act({ type: 'settle' })}>{t.settle}</button></>}
    {['complete', 'failed'].includes(run.stage) && ready && (run.navigation && content?.visits ? <button onClick={() => act({ type: 'continue-neighborhood' })}>{t.exploreNeighborhood}</button> : <p className="muted">{t.end}</p>)}
    {run.stage === 'neighborhood' && <>
      {run.destination && ready && <button onClick={() => act({ type: 'meet-place', place: run.destination! })}>{t.talk}</button>}
      {!run.destination && content?.visits && (['square', 'workshop'] as const).map(destination => <button key={destination} onClick={() => act({ type: 'choose-place', place: destination })}>{t.visitPlace} {t.places[destination]}</button>)}
      {atPlace(run, 'office') && !run.events.some(event => event.type === 'accept') && <button onClick={() => act({ type: 'return-to-offer' })}>{t.reconsider}</button>}
    </>}
    {visit && ['square', 'workshop'].includes(run.stage) && atPlace(run, place) && <>
      {run.completedErrands.includes(place) && <p>{visit.complete}</p>}
      <DialogueChoices key={place} label={t.askDetails} back={t.backToChoices} initial={<>
        {!run.replies.includes(`${place}:help`) && !run.errand && <><p className="muted">{t.helpEffort}</p><button onClick={() => act({ type: 'reply', reply: 'help' })}>{visit.help}</button></>}
        <button onClick={() => act({ type: 'finish-conversation' })}>{t.leaveConversation}</button>
      </>}>
        {run.replies.includes(`${place}:listen`) ? <p role="status">{visit.response}</p> : <button onClick={() => act({ type: 'reply', reply: 'listen' })}>{visit.listen}</button>}
        {place === 'square' && run.events.some(event => event.type === 'arrive') && <p>{run.letterDestroyed && run.events.some(event => event.type === 'report-loss') ? visit.letterDestroyed : run.letterOpened && run.delivered ? visit.letterOpened : visit.returningRecipient}</p>}
      </DialogueChoices>
    </>}
    {run.stage === 'errand' && ready && <button onClick={() => act({ type: 'inspect' })}>{t.inspectPlace}</button>}
    {run.stage === 'errand-return' && ready && <button onClick={() => act({ type: 'finish-errand' })}>{t.shareFindings}</button>}
  </div>;
}
