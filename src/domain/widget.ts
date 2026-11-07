import {tourFor} from './journey.ts';
import type { Run } from './prologue.ts';
import type { StepSnapshot } from '../health/steps.ts';
import { worldGraph, positionOn, remainingQuestSteps, enableNavigation } from './navigation.ts';
import { knownPlaces } from './encounters.ts';
import {en,fr} from '../content/ui.ts';
import type { Locale } from '../content/ui.ts';

export function widgetSnapshot(run: Run | null, health: StepSnapshot, locale: Locale) {
  if (!run) return null;
  const nav=run.navigation??enableNavigation(run).navigation, view={...run,navigation:nav};
  const graph=worldGraph(view), center=positionOn(view,nav);
  const relative=(point:{x:number;y:number})=>({x:point.x-center.x,y:point.y-center.y});
  const segments=graph.edges.flatMap(edge=>{
    const range=nav.walked[edge.id];if(!range)return [];
    const from=relative(positionOn(view,{...nav,edge:edge.id,offset:range.min}));
    const to=relative(positionOn(view,{...nav,edge:edge.id,offset:range.max}));
    return [{x1:from.x,y1:from.y,x2:to.x,y2:to.y}];
  });
  const active=Boolean(run.campaign.focus)||['street','job','delivery','handover','settlement','errand','errand-return'].includes(run.stage)||Boolean(run.destination);
  const tour=tourFor(run);
  const notebook=locale==='fr'?`${tour.carried} lettre(s) en sac · ${tour.returns} retour(s) possible(s)`:`${tour.carried} letter(s) carried · ${tour.returns} optional return(s)`;
  const destination=tour.journey?(locale==='fr'?fr:en).places[tour.journey.destination]:'';
  return JSON.stringify({notebook:destination?`${destination} · ${notebook}`:notebook,locale,segments,places:knownPlaces(run).map(place=>({...relative(graph.places[place]),color:place==='office'?'#ffe05c':'#999999'})),remaining:active?remainingQuestSteps(view)??null:null,count:health.count,day:health.dayKey?.split('|')[0]??'',goal:run.goal,updatedAt:Date.now()});
}
