import {CharacterConversation} from './CharacterConversation.tsx';
import {RevisitPanel} from './RevisitPanel.tsx';
import {letterCapacity} from '../domain/skills.ts';
import {deliveryXP} from '../domain/experience.ts';
import type { Action, Run } from '../domain/prologue.ts';
import { availableLetters, allLetterRules as letterRules, characterAt, campaignComplete } from '../domain/campaign.ts';
import { currentNode, worldGraph } from '../domain/navigation.ts';
import { campaignUI } from '../content/campaign-ui.ts';
import type { OpeningContent } from '../content/narrative.ts';
import type { Locale } from '../content/ui.ts';
import { DialogueChoices } from './DialogueChoices.tsx';
import { StairPanel } from './StairPanel.tsx';

export function CampaignPanel({ run, locale, content, act }: { run: Run; locale: Locale; content: OpeningContent; act: (action: Action) => void }) {
  const c = campaignUI(locale), pack = content.campaign, place = currentNode(run);
  if (!pack || !place || !run.navigation) return null;
  const visited = run.campaign.visited.includes(place), person = characterAt(run,place), known = content.characters[person as keyof typeof content.characters];
  const personal=run.campaign.letters.n04, waitingReturn=place==='bridge' && personal?.status==='delivered' && !personal.reported;
  const conversation=person?pack.conversations?.[person]:undefined, reply=person?run.campaign.replies?.[person]:undefined;
  const offers = availableLetters(run, place).filter(rule => pack.letters[rule.id]);
  const routes = worldGraph(run).edges.filter(edge => edge.id !== 'outskirts' && (edge.from === place || edge.to === place) && !run.navigation!.authorized.includes(edge.id));
  const lastDelivery=[...run.events].reverse().find(event=>event.type==='deliver-item');
  const lastDeliveryCopy=lastDelivery?.type==='deliver-item'?pack.letters[lastDelivery.id]:undefined;
  const opposite = {north:'south',south:'north',east:'west',west:'east'} as const;
  const directions = locale === 'fr' ? {north:'Nord',south:'Sud',east:'Est',west:'Ouest'} : {north:'North',south:'South',east:'East',west:'West'};
  return <div className="campaign-panel">
    {run.errand && <button onClick={()=>act({type:'resume-help'})}>{locale==='fr'?'Reprendre le service promis':'Resume the promised help'}</button>}
    {!visited&&<button onClick={()=>act({type:'visit-campaign-place'})}>{c.look}</button>}
    {visited && <>
      {pack.sidePassage&&place==='square'&&!run.campaign.washPassage&&<button onClick={()=>act({type:'learn-side-passage'})}>{pack.sidePassage.discover}</button>}
      {pack.sidePassage&&place==='square'&&run.campaign.washPassage&&<details><summary>{locale==='fr'?'Revoir l’itinéraire du passage':'Review the passage directions'}</summary><p>{pack.sidePassage.learned}</p></details>}
      {pack.sidePassage&&place==='wash-court'&&run.campaign.letters.s01?.status==='delivered'&&!run.campaign.letters.s02&&<article>{run.campaign.washReply?<p>{run.campaign.washReply==='direct'?pack.sidePassage.directOutcome:pack.sidePassage.declineOutcome}</p>:<><p>{pack.sidePassage.replyPrompt}</p><button onClick={()=>act({type:'resolve-side-reply',reply:'direct'})}>{pack.sidePassage.direct}</button><button onClick={()=>act({type:'resolve-side-reply',reply:'declined'})}>{pack.sidePassage.decline}</button></>}</article>}

      {(waitingReturn||!run.campaign.lastOutcome)&&<p>{waitingReturn && personal.opened ? pack.personalReturn?.prompt : place==='bridge' && personal?.returnOutcome==='loss' ? pack.personalReturn?.loss : pack.places[place]?.text ?? c.idle}</p>}
      {personal?.returnOutcome==='alive' && place==='bridge' && run.campaign.lastOutcome==='personal-return' && <p>{pack.personalReturn?.alive}</p>}
      {waitingReturn && <button onClick={()=>act({type:'complete-private-return',id:'n04'})}>{personal.opened?(pack.personalReturn?.listen??c.report):c.report}</button>}
      {lastDeliveryCopy&&['delivered','opened-delivery','placed'].includes(run.campaign.lastOutcome??'')&&<p>{lastDeliveryCopy.delivered}</p>}
      {run.campaign.lastOutcome==='opened-delivery'&&<p className="muted">{locale==='fr'?'Le sceau rompu a diminué la confiance.':'The broken seal reduced trust.'}</p>}
      {run.campaign.lastOutcome&&c.outcome[run.campaign.lastOutcome]&&!(lastDeliveryCopy&&['delivered','opened-delivery','placed'].includes(run.campaign.lastOutcome)) && <p role="status">{c.outcome[run.campaign.lastOutcome]}</p>}
      {person && known && <p className="muted">{known.name} · {c.trust} {run.campaign.trust[person] ?? 0}{run.campaign.friends.includes(person) ? ` · ${c.friends}` : ''}</p>}
      <RevisitPanel key={place} run={run} content={content} act={act}/>
      {person&&!waitingReturn&&conversation&&<CharacterConversation key={`${place}:${person}`} conversation={conversation} person={person} reply={reply} locale={locale} act={act}/>}
      {pack.stairPassage && <StairPanel run={run} copy={pack.stairPassage} act={act} />}
      {person && (run.campaign.trust[person]??0)>=3 && !run.campaign.friends.includes(person) && <button onClick={()=>act({type:'befriend',character:person})}>{c.friend}</button>}
      {offers.map(rule => <details className="message-offer" key={rule.id}><summary>{pack.letters[rule.id].title}</summary><p>{pack.letters[rule.id].offer}</p><p className="muted">{deliveryXP(rule.id)} XP · {locale==='fr'?'à la livraison':'on delivery'}</p>
        <DialogueChoices label={c.details} back={c.choices} initial={<><button disabled={Object.values(run.campaign.letters).filter(item=>item.status==='carried').length>=letterCapacity(run)} onClick={()=>act({type:'take-letter',id:rule.id})}>{c.take}</button><button onClick={()=>act({type:'decline-letter',id:rule.id})}>{c.decline}</button></>}>
          <p>{pack.letters[rule.id].question}</p><p>{pack.letters[rule.id].answer}</p>{rule.postal ? <p>{c.pay}: {rule.pay} · {c.deductions}: 4</p> : <p>{c.gift}</p>}
        </DialogueChoices>
      </details>)}
      {letterRules.filter(rule=>run.campaign.letters[rule.id] && pack.letters[rule.id]).map(rule=>{
        const item=run.campaign.letters[rule.id], copy=pack.letters[rule.id];
        if (item.status==='carried' && rule.to===place) return <article key={rule.id}><h3>{copy.title}</h3><p>{locale==='fr'?'Destinataire : ':'Recipient: '}{content.characters[(rule.to==='bridge'&&characterAt(run,'bridge')==='witness'?'witness':rule.recipient) as keyof typeof content.characters]?.name??(locale==='fr'?'le lieu indiqué':'the indicated place')}</p><button onClick={()=>act({type:'deliver-item',id:rule.id})}>{c.deliver}</button></article>;
        if (rule.id==='n04' && item.status==='delivered') return null;
        if (rule.from!==place) return null;
        if (item.status==='carried') return <button key={rule.id} onClick={()=>act({type:'return-item',id:rule.id})}>{c.return} · {copy.title}</button>;
        if (item.reported || !['delivered','destroyed'].includes(item.status)) return null;
        return <article key={rule.id}><h3>{copy.title}</h3><button onClick={()=>act({type:'report-item',id:rule.id,honest:true})}>{c.report}</button>{!item.senderWitnessed && (item.opened||item.status==='destroyed') && <button onClick={()=>act({type:'report-item',id:rule.id,honest:false})}>{c.lie}</button>}</article>;
      })}
      {routes.length>0 && <DialogueChoices label={c.routes} back={c.choices} initial={null}>{routes.map(edge=><button key={edge.id} onClick={()=>act({type:'chart-route',place:edge.from===place?edge.to:edge.from})}>{c.chart} · {directions[edge.from===place?edge.direction:opposite[edge.direction]]} · {(edge.length/run.goal).toLocaleString(locale)} {locale==='fr'?'objectif(s)':'goal(s)'}</button>)}</DialogueChoices>}
      {campaignComplete(run) && <details><summary>{c.endTitle}</summary><p>{pack.ending}</p></details>}
    </>}
  </div>;
}

function ruleWasRedirected(run: Run,id: string) { return run.campaign.letters[id]?.deliveredTo==='witness'; }

export function CampaignLetters({ run, locale, content, act }: { run: Run; locale: Locale; content?: OpeningContent; act: (action: Action) => void }) {
  const c=campaignUI(locale), pack=content?.campaign;
  if (!pack) return null;
  return <>{Object.entries(run.campaign.letters).filter(([,item])=>item.status!=='declined').map(([id,item])=>{
    const copy=pack.letters[id]; if (!copy) return null;
    return <article key={id}><h3>{copy.title}</h3><p>{c[item.status]} · {item.opened?c.opened:c.sealed}</p>
      {item.opened && <p className="letter-body">{copy.body}</p>}
      {item.status==='delivered' && <p>{ruleWasRedirected(run,id) ? copy.deliveredAfterLoss ?? copy.delivered : copy.delivered}</p>}
      {item.status==='carried' && <div className="actions">{!item.opened && <button onClick={()=>act({type:'open-item',id})}>{c.open}</button>}<button onClick={()=>{if(window.confirm(c.confirmDestroy))act({type:'destroy-item',id});}}>{c.destroy}</button><button onClick={()=>act({type:'focus-letter',id,returning:false})}>{c.focus}</button></div>}
      {!item.reported && ['delivered','destroyed'].includes(item.status) && <button onClick={()=>act({type:'focus-letter',id,returning:true})}>{c.back}</button>}
    </article>;
  })}</>;
}
