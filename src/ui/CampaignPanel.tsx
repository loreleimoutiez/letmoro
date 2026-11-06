import type { Action, Run } from '../domain/prologue.ts';
import { availableLetters, letterRules, peopleAt, campaignComplete } from '../domain/campaign.ts';
import { currentNode, worldGraph } from '../domain/navigation.ts';
import { routeBetween } from '../domain/campaign-reducer.ts';
import { campaignUI } from '../content/campaign-ui.ts';
import type { OpeningContent } from '../content/narrative.ts';
import type { Locale } from '../content/ui.ts';
import { DialogueChoices } from './DialogueChoices.tsx';

export function CampaignPanel({ run, locale, content, act }: { run: Run; locale: Locale; content: OpeningContent; act: (action: Action) => void }) {
  const c = campaignUI(locale), pack = content.campaign, place = currentNode(run);
  if (!pack || !place || !run.navigation) return null;
  const visited = run.campaign.visited.includes(place), person = peopleAt[place], known = content.characters[person as keyof typeof content.characters];
  const conversation=person?pack.conversations?.[person]:undefined, reply=person?run.campaign.replies?.[person]:undefined;
  const offers = availableLetters(run, place).filter(rule => pack.letters[rule.id]);
  const routes = worldGraph(run).edges.filter(edge => edge.id !== 'outskirts' && (edge.from === place || edge.to === place) && !run.navigation!.authorized.includes(edge.id));
  const focus = run.campaign.focus, focused = letterRules.find(rule => rule.id === focus?.id);
  const target = focused ? focus?.returning ? focused.from : focused.to : undefined;
  const nextRoad = target && target !== place ? routeBetween(run,place,target)[0] : undefined;
  const road = nextRoad ? worldGraph(run).edges.find(edge=>edge.id===nextRoad) : undefined;
  const opposite = {north:'south',south:'north',east:'west',west:'east'} as const;
  const directions = locale === 'fr' ? {north:'Nord',south:'Sud',east:'Est',west:'Ouest'} : {north:'North',south:'South',east:'East',west:'West'};
  return <div className="campaign-panel">
    {run.errand && <button onClick={()=>act({type:'resume-help'})}>{locale==='fr'?'Reprendre le service promis':'Resume the promised help'}</button>}
    {road && <p className="muted">{pack.letters[focused!.id]?.title} · {directions[road.from===place?road.direction:opposite[road.direction]]}</p>}
    <button onClick={()=>act({type:'visit-campaign-place'})}>{c.look}</button>
    {visited && <>
      <p>{pack.places[place]?.text ?? c.idle}</p>
      {run.campaign.lastOutcome && <p role="status">{c.outcome[run.campaign.lastOutcome]}</p>}
      {person && known && <p className="muted">{known.name} · {c.trust} {run.campaign.trust[person] ?? 0}{run.campaign.friends.includes(person) ? ` · ${c.friends}` : ''}</p>}
      {person && conversation && <article><p>{conversation.prompt}</p>{reply?<p>{reply==='listen'?conversation.listening:conversation.pressing}</p>:<><button onClick={()=>act({type:'dialogue',character:person,reply:'listen'})}>{conversation.listen}</button><button onClick={()=>act({type:'dialogue',character:person,reply:'press'})}>{conversation.press}</button></>}</article>}
      {person && (run.campaign.trust[person]??0)>=3 && !run.campaign.friends.includes(person) && <button onClick={()=>act({type:'befriend',character:person})}>{c.friend}</button>}
      {offers.map(rule => <article key={rule.id}><h3>{pack.letters[rule.id].title}</h3><p>{pack.letters[rule.id].offer}</p>
        <DialogueChoices label={c.details} back={c.choices} initial={<><button disabled={Object.values(run.campaign.letters).filter(item=>item.status==='carried').length>=3} onClick={()=>act({type:'take-letter',id:rule.id})}>{c.take}</button><button onClick={()=>act({type:'decline-letter',id:rule.id})}>{c.decline}</button></>}>
          <p>{pack.letters[rule.id].question}</p><p>{pack.letters[rule.id].answer}</p><p>{c.noDeadline}</p>{rule.postal ? <p>{c.pay}: {rule.pay} · {c.deductions}: 4</p> : <p>{c.gift}</p>}
        </DialogueChoices>
      </article>)}
      {letterRules.filter(rule=>run.campaign.letters[rule.id] && pack.letters[rule.id]).map(rule=>{
        const item=run.campaign.letters[rule.id], copy=pack.letters[rule.id];
        if (item.status==='carried' && rule.to===place) return <article key={rule.id}><h3>{copy.title}</h3><button onClick={()=>act({type:'deliver-item',id:rule.id})}>{c.deliver}</button></article>;
        if (rule.from!==place) return null;
        if (item.status==='carried') return <button key={rule.id} onClick={()=>act({type:'return-item',id:rule.id})}>{c.return} · {copy.title}</button>;
        if (item.reported || !['delivered','destroyed'].includes(item.status)) return null;
        return <article key={rule.id}><h3>{copy.title}</h3><button onClick={()=>act({type:'report-item',id:rule.id,honest:true})}>{c.report}</button>{!item.senderWitnessed && (item.opened||item.status==='destroyed') && <button onClick={()=>act({type:'report-item',id:rule.id,honest:false})}>{c.lie}</button>}{item.status==='delivered' && <p>{copy.report}</p>}</article>;
      })}
      {routes.length>0 && <DialogueChoices label={c.routes} back={c.choices} initial={null}>{routes.map(edge=><button key={edge.id} onClick={()=>act({type:'chart-route',place:edge.from===place?edge.to:edge.from})}>{c.chart} · {directions[edge.from===place?edge.direction:opposite[edge.direction]]} · {(edge.length/run.goal).toLocaleString(locale)} {locale==='fr'?'objectif(s)':'goal(s)'}</button>)}</DialogueChoices>}
      {campaignComplete(run) && <article><h3>{c.endTitle}</h3><p>{pack.ending}</p></article>}
    </>}
  </div>;
}

export function CampaignLetters({ run, locale, content, act }: { run: Run; locale: Locale; content?: OpeningContent; act: (action: Action) => void }) {
  const c=campaignUI(locale), pack=content?.campaign;
  if (!pack) return null;
  return <>{Object.entries(run.campaign.letters).filter(([,item])=>item.status!=='declined').map(([id,item])=>{
    const copy=pack.letters[id]; if (!copy) return null;
    return <article key={id}><h3>{copy.title}</h3><p>{c[item.status]} · {item.opened?c.opened:c.sealed}</p>
      {item.opened && <p className="letter-body">{copy.body}</p>}
      {item.status==='delivered' && <p>{copy.delivered}</p>}
      {item.status==='carried' && <div className="actions">{!item.opened && <button onClick={()=>act({type:'open-item',id})}>{c.open}</button>}<button onClick={()=>{if(window.confirm(c.confirmDestroy))act({type:'destroy-item',id});}}>{c.destroy}</button><button onClick={()=>act({type:'focus-letter',id,returning:false})}>{c.focus}</button></div>}
      {!item.reported && ['delivered','destroyed'].includes(item.status) && <button onClick={()=>act({type:'focus-letter',id,returning:true})}>{c.back}</button>}
    </article>;
  })}</>;
}
