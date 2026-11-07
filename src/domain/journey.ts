import type {Run} from './prologue.ts';
import {allLetterRules as letterRules} from './campaign.ts';
import {routeBetween} from './campaign-reducer.ts';
import {currentNode,questPlace,remainingQuestSteps,worldGraph} from './navigation.ts';
import type {Direction,Place} from './navigation.ts';
const opposite:Record<Direction,Direction>={north:'south',south:'north',east:'west',west:'east'};
export interface Journey {
  kind:'job'|'delivery'|'report'|'help'|'help-return'|'explore';
  destination:Place;
  letterId?:string;
  sender?:string;
  recipient?:string;
  remaining:number;
  nextDirection?:Direction;
  heading?:Direction;
}
export function journeyFor(run:Run):Journey|undefined {
  const destination=questPlace(run);
  if(!destination)return;
  const focus=run.campaign.focus, rule=letterRules.find(letter=>letter.id===focus?.id);
  let kind:Journey['kind'];
  if(run.stage==='campaign'){if(!rule)return;kind=focus?.returning?'report':'delivery';}
  else if(['street','job','rest'].includes(run.stage))kind='job';
  else if(['delivery','handover','settlement'].includes(run.stage))kind='delivery';
  else if(run.stage==='errand')kind='help';
  else if(run.stage==='errand-return')kind='help-return';
  else if(run.stage==='neighborhood'&&run.destination)kind='explore';
  else return;
  const remaining=remainingQuestSteps(run)??0;
  const result:Journey={kind,destination,remaining,...(rule?{letterId:rule.id,sender:rule.sender,recipient:rule.recipient}:{})};
  const nav=run.navigation;
  if(!nav)return result;
  const graph=worldGraph(run),edge=graph.edges.find(road=>road.id===nav.edge)!;
  if(nav.heading)result.heading=nav.heading===1?edge.direction:opposite[edge.direction];
  const node=currentNode(run);
  if(node&&node!==destination){
    try{const id=routeBetween(run,node,destination,true)[0],road=graph.edges.find(road=>road.id===id);if(road)result.nextDirection=road.from===node?road.direction:opposite[road.direction];}catch{/* An unavailable objective never authorizes a shortcut. */}
  }
  return result;
}
export function tourFor(run:Run){
  const letters=Object.values(run.campaign.letters);
  const first=run.events.some(event=>event.type==='accept')&&!run.events.some(event=>event.type==='deliver'||event.type==='report-loss')&&!run.letterDestroyed?1:0;
  return {carried:letters.filter(letter=>letter.status==='carried').length+first,returns:letters.filter(letter=>!letter.reported&&['delivered','destroyed'].includes(letter.status)).length,journey:journeyFor(run)};
}
