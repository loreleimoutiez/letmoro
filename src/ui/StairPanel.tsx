import type { Action, Run } from '../domain/prologue.ts';
import { stairActionAvailable } from '../domain/stairs.ts';
import { currentNode } from '../domain/navigation.ts';
import type { StairContent } from '../content/narrative.ts';

export function StairPanel({ run, copy, act }: { run: Run; copy: StairContent; act: (action: Action) => void }) {
  const state = run.campaign.stair, place = currentNode(run);
  const available = (type: Parameters<typeof stairActionAvailable>[1]) => stairActionAvailable(run, type);
  const correction = run.campaign.letters.s08;
  const requestId = state?.request === 'diagram' ? 's04' : state?.request === 'meeting' ? 's05' : undefined;
  return <section className="stair-conversation">
    {available('learn-stair-passage') && <button onClick={() => act({ type: 'learn-stair-passage' })}>{copy.discover}</button>}
    {state?.passage && place === 'workshop' && <details><summary>{copy.review}</summary><p>{copy.learned}</p></details>}
    {available('learn-stair-link') && <button onClick={() => act({ type: 'learn-stair-link' })}>{copy.link}</button>}
    {state?.link && place === 'stair-houses' && <details><summary>{copy.review}</summary><p>{copy.linkLearned}</p></details>}
    {available('choose-stair-request') && <article><p>{copy.requestPrompt}</p>{(['diagram', 'meeting', 'declined'] as const).map(reply =>
      <button key={reply} onClick={() => act({ type: 'choose-stair-request', reply })}>{reply === 'declined' ? copy.decline : copy[reply]}</button>)}</article>}
    {state?.request && (!requestId || !run.campaign.letters[requestId]) && place === 'stair-houses' && <p role="status">{copy.requestOutcomes[state.request]}</p>}
    {available('volunteer-stair-work') && <button onClick={() => { if (window.confirm(copy.volunteerConfirm)) act({ type: 'volunteer-stair-work' }); }}>{copy.volunteer}</button>}
    {state?.volunteered && place === 'workshop' && correction?.status !== 'delivered' && <p>{copy.volunteered}</p>}
    {available('disclose-stair-claim') && <button onClick={() => act({ type: 'disclose-stair-claim' })}>{copy.disclose}</button>}
    {state?.disclosed && place === 'stair-houses' && !correction && <p>{copy.disclosed}</p>}
    {correction?.status === 'delivered' && correction.reported && correction.honest && place === 'stair-houses' && <p>{copy.correctionReported}</p>}
    {available('resolve-stair-response') && <article><p>{copy.responsePrompt}</p><button onClick={() => act({ type: 'resolve-stair-response', reply: 'accepted' })}>{copy.acceptResponse}</button><button onClick={() => act({ type: 'resolve-stair-response', reply: 'declined' })}>{copy.declineResponse}</button></article>}
    {state?.response && place === 'stair-houses' && <p role="status">{state.response === 'declined' ? copy.responseDeclined : state.request === 'diagram' ? copy.diagramAccepted : copy.meetingAccepted}</p>}
  </section>;
}
