import {apply,createRun} from '../src/domain/prologue.ts';
import type {Run} from '../src/domain/prologue.ts';
import {worldGraph,currentNode} from '../src/domain/navigation.ts';
import type {Place} from '../src/domain/navigation.ts';
import {routeBetween} from '../src/domain/campaign-reducer.ts';
import {letterRules} from '../src/domain/campaign.ts';
function travel(run:Run,target:Place){
 const opposite={north:'south',south:'north',east:'west',west:'east'}as const;
 for(const id of routeBetween(run,currentNode(run)!,target)){
  const edge=worldGraph(run).edges.find(edge=>edge.id===id)!,from=currentNode(run)!;
  if(!run.navigation!.authorized.includes(id))run=apply(run,{type:'chart-route',place:edge.from===from?edge.to:edge.from});
  run=apply(run,{type:'choose-direction',direction:edge.from===from?edge.direction:opposite[edge.direction]});
  if(currentNode(run)!==(edge.from===from?edge.to:edge.from))run=apply(run,{type:'steps',amount:edge.length});
  run=apply(run,{type:'visit-campaign-place'});
 }
 return run;
}
export function measureCampaign(goal:number,reports:boolean,errands=false){
 let run=createRun(goal);
 for(const action of [{type:'enable-navigation'},{type:'steps',amount:Math.ceil(goal*.02)},{type:'cross'},{type:'accept'},{type:'steps',amount:Math.ceil(goal*.1)},{type:'arrive'},{type:'deliver'},{type:'settle'}]as const)run=apply(run,action);
 if(errands){
  const walk=(direction:'north'|'south'|'east'|'west',id:string)=>{run=apply(run,{type:'choose-direction',direction});run=apply(run,{type:'steps',amount:worldGraph(run).edges.find(edge=>edge.id===id)!.length});};
  run=apply(run,{type:'continue-neighborhood'});run=apply(run,{type:'choose-place',place:'square'});walk('west','square');run=apply(run,{type:'meet-place',place:'square'});run=apply(run,{type:'reply',reply:'help'});walk('north','garden');run=apply(run,{type:'inspect'});walk('south','garden');run=apply(run,{type:'finish-errand'});run=apply(run,{type:'finish-conversation'});
  run=apply(run,{type:'choose-place',place:'workshop'});walk('east','square');walk('east','workshop');run=apply(run,{type:'meet-place',place:'workshop'});run=apply(run,{type:'reply',reply:'help'});walk('north','gate');run=apply(run,{type:'inspect'});walk('south','gate');run=apply(run,{type:'finish-errand'});run=apply(run,{type:'finish-conversation'});
 }
 run=apply(run,{type:'enter-campaign'});run=apply(run,{type:'visit-campaign-place'});
 for(const rule of [...letterRules].sort((a,b)=>a.unlock-b.unlock)){
  run=travel(run,rule.from);run=apply(run,{type:'take-letter',id:rule.id});run=travel(run,rule.to);run=apply(run,{type:'deliver-item',id:rule.id});
  if(reports){run=travel(run,rule.from);run=apply(run,rule.id==='n04'?{type:'complete-private-return',id:rule.id}:{type:'report-item',id:rule.id,honest:true});}
 }
 run=travel(run,'square');run=apply(run,{type:'learn-side-passage'});
 run=apply(run,{type:'take-letter',id:'s01'});run=travel(run,'wash-court');run=apply(run,{type:'deliver-item',id:'s01'});
 run=apply(run,{type:'take-letter',id:'s02'});run=travel(run,'square');run=apply(run,{type:'deliver-item',id:'s02'});
 if(reports){run=apply(run,{type:'report-item',id:'s01',honest:true});run=travel(run,'wash-court');run=apply(run,{type:'report-item',id:'s02',honest:true});}
 return {policy:reports?'one letter at a time, all optional reports':'one letter at a time, no optional reports',errandsIncluded:errands,goal,lettersDelivered:run.delivered,steps:run.navigation!.odometer!,goalEquivalents:run.navigation!.odometer!/goal};
}
// Deliberately explicit itineraries: neither an optimal route nor a calendar-duration forecast.
if(process.argv[1]?.endsWith('measure-campaign.ts'))for(const [reports,errands] of [[false,false],[true,false],[true,true]])console.log(JSON.stringify(measureCampaign(10000,reports,errands)));
