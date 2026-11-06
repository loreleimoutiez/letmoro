import type { Run } from './prologue.ts';
import type { CampaignAction, Campaign, EntrustedLetter } from './campaign.ts';
import { availableLetters, letterRules, peopleAt, resolvedLetters } from './campaign.ts';
import { currentNode, worldGraph } from './navigation.ts';
import type { Place, EdgeId } from './navigation.ts';

export function routeBetween(run: Run, from: Place, to: Place): EdgeId[] {
  const roads = worldGraph(run).edges.filter(edge => edge.id !== 'outskirts');
  const queue: { place: Place; path: EdgeId[]; cost:number }[] = [{ place:from,path:[],cost:0 }], seen = new Set<Place>();
  while (queue.length) {
    queue.sort((a,b)=>a.cost-b.cost);
    const next = queue.shift()!;
    if (next.place === to) return next.path;
    if (seen.has(next.place)) continue;
    seen.add(next.place);
    for (const edge of roads) {
      const other = edge.from === next.place ? edge.to : edge.to === next.place ? edge.from : undefined;
      if (other && !seen.has(other)) queue.push({place:other,path:[...next.path,edge.id],cost:next.cost+edge.length});
    }
  }
  throw new Error('Destination unavailable');
}
export function reduceCampaign(run: Run, action: CampaignAction): Partial<Run> {
  let campaign: Campaign = run.campaign;
  const place = currentNode(run);
  const trust = (who: string, amount: number) => ({ ...campaign.trust, [who]: Math.max(-10, Math.min(10, (campaign.trust[who] ?? 0) + amount)) });
  const write = (id: string, letter: EntrustedLetter) => ({ ...campaign.letters, [id]:letter });
  if (action.type === 'enter-campaign') {
    if (!place || ['street','job','delivery','handover','settlement','errand','errand-return'].includes(run.stage)) throw new Error('Conversation still pending');
    return { stage:'campaign', campaign:{...campaign,active:true,trust:campaign.active?campaign.trust:{...campaign.trust,recipient:run.letterDestroyed?-2:run.letterOpened?-1:run.delivered?1:0}} };
  }
  if (action.type === 'capture-thought') {
    if (campaign.pendingThought || (run.navigation?.odometer ?? 0)-campaign.thoughtMark < run.goal*.5 || !/^t(0[1-9]|[12]\d|30)$/.test(action.id)) throw new Error('Thought unavailable');
    return { campaign:{...campaign,pendingThought:action.id,lastThought:action.id,thoughtMark:run.navigation?.odometer ?? 0,thoughts:[...new Set([...campaign.thoughts,action.id])]} };
  }
  if (action.type === 'dismiss-thought') {
    if (!campaign.pendingThought) throw new Error('No thought to acknowledge');
    return {campaign:{...campaign,pendingThought:undefined,thoughtMark:run.navigation?.odometer ?? 0}};
  }
  if (run.stage !== 'campaign' && !['open-item','destroy-item','focus-letter'].includes(action.type)) throw new Error('Campaign is not active');
  if (action.type === 'chart-route') {
    if (!place || !run.navigation) throw new Error('Not at a junction');
    const edge = worldGraph(run).edges.find(edge => (edge.from === place && edge.to === action.place) || (edge.to === place && edge.from === action.place));
    if (!edge || edge.id === 'outskirts') throw new Error('No such route');
    return {navigation:{...run.navigation,authorized:[...new Set([...run.navigation.authorized,edge.id])]} };
  }
  if (action.type === 'visit-campaign-place') {
    if (!place || ['start','approach','outskirts'].includes(place)) throw new Error('Nothing to visit here');
    let sous = run.sous;
    campaign = {...campaign,lastOutcome:undefined};
    const delayed = campaign.delayed.map(item => {
      const rule = letterRules.find(rule => rule.id === item.id)!;
      if (item.settled || item.due > resolvedLetters(run) || rule.from !== place) return item;
      campaign = {...campaign,trust:trust(rule.sender,-3),lastOutcome:'contradiction'};
      sous = Math.max(0,sous - (rule.postal ? 2 : 0));
      return {...item,settled:true};
    });
    return {sous,campaign:{...campaign,visited:[...new Set([...campaign.visited,place])],encounters:peopleAt[place]?[...(campaign.encounters??[]),{character:peopleAt[place]!,place,event:run.events.length}]:campaign.encounters,delayed}};
  }
  if (action.type === 'dialogue') {
    if (!place || !campaign.visited.includes(place) || peopleAt[place] !== action.character || campaign.replies?.[action.character] || !['listen','press'].includes(action.reply)) throw new Error('Dialogue unavailable');
    const change = action.reply === 'listen' ? 1 : ['keeper','archivist','repairer'].includes(action.character) ? 1 : action.character === 'host' ? 0 : -1;
    return {campaign:{...campaign,replies:{...campaign.replies,[action.character]:action.reply},trust:trust(action.character,change)}};
  }
  if (action.type === 'befriend') {
    if (!place || peopleAt[place] !== action.character || (campaign.trust[action.character] ?? 0) < 3 || campaign.friends.includes(action.character)) throw new Error('Friendship unavailable');
    return {campaign:{...campaign,friends:[...campaign.friends,action.character],lastOutcome:'friend'}};
  }
  const rule = letterRules.find(rule => rule.id === action.id);
  if (!rule) throw new Error('Unknown letter');
  const item = campaign.letters[rule.id];
  switch (action.type) {
    case 'take-letter': case 'decline-letter': {
      if (!place || !campaign.visited.includes(place) || !availableLetters(run,place).some(offer => offer.id === rule.id) || !run.navigation) throw new Error('Offer unavailable');
      if (action.type === 'take-letter' && Object.values(campaign.letters).filter(letter => letter.status === 'carried').length >= 3) throw new Error('Letter bag is full');
      const accepted = action.type === 'take-letter';
      const path = accepted ? routeBetween(run,place,rule.to) : [];
      return {navigation:{...run.navigation,authorized:[...new Set([...run.navigation.authorized,...path])]},campaign:{...campaign,letters:write(rule.id,{opened:false,status:accepted?'carried':'declined',reported:false}),...(accepted?{focus:{id:rule.id,returning:false}}:{})}};
    }
    case 'focus-letter':
      if (!item || (!action.returning && item.status !== 'carried') || (action.returning && (item.reported || !['delivered','destroyed'].includes(item.status)))) throw new Error('No such objective');
      return {campaign:{...campaign,focus:{id:rule.id,returning:action.returning}}};
    case 'open-item':
      if (!item || item.status !== 'carried' || item.opened) throw new Error('Letter cannot be opened');
      return {campaign:{...campaign,letters:write(rule.id,{...item,opened:true,...(place===rule.from?{senderWitnessed:'opened' as const}:{})}),...(place===rule.from?{trust:trust(rule.sender,-1)}:{})}};
    case 'destroy-item':
      if (!item || item.status !== 'carried') throw new Error('Letter cannot be destroyed');
      return {campaign:{...campaign,letters:write(rule.id,{...item,status:'destroyed',...(place===rule.from?{senderWitnessed:'destroyed' as const}:{})}),focus:campaign.focus?.id===rule.id?undefined:campaign.focus,lastOutcome:'destroyed',...(place===rule.from?{trust:trust(rule.sender,-2)}:{})}};
    case 'deliver-item': {
      if (!item || item.status !== 'carried' || place !== rule.to || !campaign.visited.includes(place)) throw new Error('Delivery unavailable');
      return {sous:run.sous+(rule.postal?Math.max(0,rule.pay-4):0),delivered:run.delivered+1,campaign:{...campaign,letters:write(rule.id,{...item,status:'delivered'}),focus:campaign.focus?.id===rule.id?undefined:campaign.focus,trust:rule.recipient==='memory'?campaign.trust:trust(rule.recipient,item.opened?-2:1),lastOutcome:rule.recipient==='memory'?'placed':item.opened?'opened-delivery':'delivered'}};
    }
    case 'return-item':
      if (!item || item.status !== 'carried' || place !== rule.from) throw new Error('Return unavailable');
      return {campaign:{...campaign,letters:write(rule.id,{...item,status:'returned',reported:true,honest:true}),focus:campaign.focus?.id===rule.id?undefined:campaign.focus,trust:trust(rule.sender,item.opened?-2:-1),lastOutcome:'returned'}};
    case 'report-item': {
      if (!item || item.reported || !['delivered','destroyed'].includes(item.status) || place !== rule.from || typeof action.honest !== 'boolean') throw new Error('Report unavailable');
      const lie = !action.honest && (item.opened || item.status==='destroyed');
      if (lie && item.senderWitnessed) throw new Error('Sender already witnessed the breach');
      const reward = rule.gift && (item.status==='delivered' || lie) ? rule.gift : 0;
      const wages = lie && item.status==='destroyed' && rule.postal ? Math.max(0,rule.pay-4) : 0;
      const reputation = lie ? 1 : item.status==='destroyed' ? item.senderWitnessed==='destroyed'?0:-2 : item.opened ? item.senderWitnessed?0:-1 : 1;
      return {sous:run.sous+reward+wages,campaign:{...campaign,letters:write(rule.id,{...item,reported:true,honest:!lie}),focus:campaign.focus?.id===rule.id?undefined:campaign.focus,trust:trust(rule.sender,reputation),lastOutcome:lie?'lie':'reported',delayed:lie?[...campaign.delayed,{id:rule.id,due:resolvedLetters(run)+2,settled:false}]:campaign.delayed}};
    }
  }
}
