import type { Action, Run } from '../domain/prologue.ts';
import { belongingsActionAvailable, belongingsSceneHere } from '../domain/belongings.ts';
import { currentNode } from '../domain/navigation.ts';
import type { BelongingsContent } from '../content/narrative.ts';

export function BelongingsPanel({ run, copy, act }: { run: Run; copy: BelongingsContent; act: (action: Action) => void }) {
  const state = run.campaign.belongings, place = currentNode(run);
  const available = (type: Parameters<typeof belongingsActionAvailable>[1]) => belongingsActionAvailable(run, type);
  const outcome = state?.outcome ? copy.outcomes[state.outcome] : undefined;
  return <section className="belongings-conversation">
    {available('learn-belongings-passage') && <button onClick={() => act({ type: 'learn-belongings-passage' })}>{place === 'courtyard' ? copy.discoverRecipient : copy.discoverResident}</button>}
    {state && ['courtyard', 'stair-houses'].includes(place ?? '') && <details><summary>{copy.review}</summary><p>{copy.learned}</p></details>}
    {available('choose-belongings-answer') && <article><p>{copy.decisionPrompt}</p>{(['clarify', 'abstain', 'guess'] as const).map(reply =>
      <button key={reply} onClick={() => { if (reply !== 'guess' || window.confirm(copy.guessConfirm)) act({ type: 'choose-belongings-answer', reply }); }}>{copy[reply]}</button>)}</article>}
    {state?.answer && !state.outcome && place === 'courtyard' && <p role="status">{copy.decisions[state.answer]}</p>}
    {available('witness-belongings-collection') && <article><p>{copy.collectionPrompt}</p><button onClick={() => act({ type: 'witness-belongings-collection' })}>{copy.witness}</button></article>}
    {outcome && place === 'landing' && (belongingsSceneHere(run) ? <p role="status">{outcome}</p> : <details><summary>{copy.recall}</summary><p>{outcome}</p></details>)}
    {available('resolve-belongings-return') && <article><p>{copy.returnPrompt}</p><button onClick={() => act({ type: 'resolve-belongings-return', reply: 'acknowledge' })}>{copy.acknowledge}</button><button onClick={() => act({ type: 'resolve-belongings-return', reply: 'leave' })}>{copy.leave}</button></article>}
    {state?.response && place === 'landing' && <p>{state.response === 'leave' ? copy.left : state.outcome === 'unauthorized' ? copy.acknowledged : copy.respected}</p>}
  </section>;
}
