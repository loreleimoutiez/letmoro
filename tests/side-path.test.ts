import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apply,createRun} from '../src/domain/prologue.ts';
import type {Run} from '../src/domain/prologue.ts';
import {worldGraph,currentNode,positionOn,revealWashPassage,availableDirections,remainingQuestSteps} from '../src/domain/navigation.ts';
import {availableLetters,resolvedLetters,campaignBadges} from '../src/domain/campaign.ts';
import {encodeSave,decodeSave} from '../src/adapters/save.ts';
function opening(goal=100){let run=createRun(goal);for(const action of [{type:'enable-navigation'},{type:'steps',amount:Math.ceil(goal*.02)},{type:'cross'},{type:'accept'},{type:'steps',amount:Math.ceil(goal*.1)},{type:'arrive'},{type:'deliver'},{type:'settle'},{type:'enter-campaign'},{type:'visit-campaign-place'},{type:'chart-route',place:'square'},{type:'choose-direction',direction:'west'},{type:'steps',amount:Math.ceil(goal*.35)},{type:'visit-campaign-place'}]as const)run=apply(run,action);return run;}
function travel(run:Run,direction:'north'|'south'|'east'|'west',edge:string){run=apply(run,{type:'choose-direction',direction});const road=worldGraph(run).edges.find(item=>item.id===edge)!;run=apply(run,{type:'steps',amount:road.length});return apply(run,{type:'visit-campaign-place'});}
function delivered(){let run=apply(opening(),{type:'learn-side-passage'});run=apply(run,{type:'take-letter',id:'s01'});run=travel(run,'east','square-west');assert.equal(currentNode(run),'wash-turn');assert(availableDirections(run).south);run=travel(run,'south','wash-lane');return apply(run,{type:'deliver-item',id:'s01'});}
test('the optional branch remains absent until an explicit witnessed discovery',()=>{
 const run=opening();assert(!worldGraph(run).edges.some(edge=>edge.id==='wash-lane'));assert(!availableLetters(run,'square').some(rule=>rule.id==='s01'));
 const position=positionOn(run,run.navigation!),odometer=run.navigation!.odometer;
 const next=apply(run,{type:'learn-side-passage'});assert.deepEqual(positionOn(next,next.navigation!),position);assert.equal(next.navigation!.odometer,odometer);assert.equal(next.reserve,run.reserve);
 assert(availableLetters(next,'square').some(rule=>rule.id==='s01'));assert.throws(()=>apply(next,{type:'learn-side-passage'}));assert.deepEqual(decodeSave(encodeSave(next)),next);
});
test('splitting the road preserves every position, walked interval and direction without granting steps',()=>{
 const base=opening(),length=worldGraph(base).edges.find(edge=>edge.id==='square')!.length;
 for(const offset of [0,1,17,18,34,35])for(const heading of [1,-1,null]as const){
 const run={...base,navigation:{...base.navigation!,edge:'square' as const,offset,heading,walked:{...base.navigation!.walked,square:{min:0,max:length}}}};
 const point=positionOn(run,run.navigation),navigation=revealWashPassage(run),next={...run,campaign:{...run.campaign,washPassage:true},navigation};
 assert.deepEqual(positionOn(next,navigation),point);assert.equal(navigation.odometer,run.navigation.odometer);
 assert.equal(Object.values(navigation.walked).reduce((sum,range)=>sum+range!.max-range!.min,0),Object.values(run.navigation.walked).reduce((sum,range)=>sum+range!.max-range!.min,0));
 }
});
test('the delivery fulfills one promise and optional reply creates a separate objective and real return',()=>{
 let run=delivered();assert.equal(run.campaign.letters.s01.status,'delivered');assert.equal(resolvedLetters(run),0);assert(availableLetters(run,'wash-court').some(rule=>rule.id==='s02'));
 const xp=run.campaign.xp??0;assert.throws(()=>apply(run,{type:'deliver-item',id:'s01'}));
 run=apply(run,{type:'take-letter',id:'s02'});assert.equal(run.campaign.focus?.id,'s02');assert((remainingQuestSteps(run)??0)>0);
 assert.throws(()=>apply(run,{type:'resolve-side-reply',reply:'direct'}));run=travel(run,'north','wash-lane');run=travel(run,'west','square-west');run=apply(run,{type:'deliver-item',id:'s02'});
 assert.equal(run.campaign.xp,(xp+18));assert.equal(run.campaign.letters.s02.status,'delivered');assert.equal(resolvedLetters(run),0);assert(!campaignBadges(run).includes('opening-complete'));assert.deepEqual(decodeSave(encodeSave(run)),run);
});
test('direct conversation and no further promise close the reply without a fabricated carried letter',()=>{
 for(const reply of ['direct','declined']as const){const run=apply(delivered(),{type:'resolve-side-reply',reply});assert.equal(run.campaign.washReply,reply);assert.equal(run.campaign.letters.s02,undefined);assert(!availableLetters(run,'wash-court').some(rule=>rule.id==='s02'));assert.throws(()=>apply(run,{type:'resolve-side-reply',reply}));assert.deepEqual(decodeSave(encodeSave(run)),run);}
});
test('opening, destruction and return use the existing witnessed consequence rules',()=>{
 let run=apply(opening(),{type:'learn-side-passage'});run=apply(run,{type:'take-letter',id:'s01'});run=apply(run,{type:'open-item',id:'s01'});assert.equal(run.campaign.trust.host,-1);run=travel(run,'east','square-west');run=travel(run,'south','wash-lane');run=apply(run,{type:'deliver-item',id:'s01'});assert.equal(run.campaign.trust.caretaker,-2);
 let destroyed=apply(opening(),{type:'learn-side-passage'});destroyed=apply(destroyed,{type:'take-letter',id:'s01'});destroyed=travel(destroyed,'east','square-west');destroyed=apply(destroyed,{type:'destroy-item',id:'s01'});assert.equal(destroyed.campaign.trust.host,undefined);destroyed=travel(destroyed,'south','wash-lane');assert.throws(()=>apply(destroyed,{type:'deliver-item',id:'s01'}));assert(!availableLetters(destroyed,'wash-court').some(rule=>rule.id==='s02'));
});
test('very small goals retain a usable branch without zero-length road segments',()=>{
 let run=apply(opening(1),{type:'learn-side-passage'});assert(worldGraph(run).edges.every(edge=>edge.length>0));run=apply(run,{type:'take-letter',id:'s01'});run=travel(run,'south','wash-lane');run=apply(run,{type:'deliver-item',id:'s01'});assert.equal(currentNode(run),'wash-court');assert.deepEqual(decodeSave(encodeSave(run)),run);
});

test('refusing employment still allows the full optional outward delivery',()=>{
 let run=createRun(100);
 for(const action of [{type:'enable-navigation'},{type:'steps',amount:2},{type:'cross'},{type:'rest'},{type:'enter-campaign'},{type:'visit-campaign-place'},{type:'chart-route',place:'courtyard'},{type:'choose-direction',direction:'north'},{type:'steps',amount:10},{type:'visit-campaign-place'},{type:'chart-route',place:'square'},{type:'choose-direction',direction:'west'},{type:'steps',amount:35},{type:'visit-campaign-place'},{type:'learn-side-passage'},{type:'take-letter',id:'s01'}]as const)run=apply(run,action);
 run=travel(run,'east','square-west');run=travel(run,'south','wash-lane');run=apply(run,{type:'deliver-item',id:'s01'});
 assert.equal(run.campaign.letters.s01.status,'delivered');assert(!run.events.some(event=>event.type==='accept'));assert.equal(resolvedLetters(run),0);assert.deepEqual(decodeSave(encodeSave(run)),run);
});
