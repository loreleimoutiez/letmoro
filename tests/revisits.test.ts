import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apply,createRun,isAction} from '../src/domain/prologue.ts';
import {revisitAvailable} from '../src/domain/revisits.ts';
import {decodeSave,encodeSave} from '../src/adapters/save.ts';
function opening(){let run=createRun(100);for(const action of [{type:'enable-navigation'},{type:'steps',amount:2},{type:'cross'},{type:'accept'},{type:'steps',amount:10},{type:'arrive'},{type:'deliver'},{type:'settle'},{type:'enter-campaign'},{type:'visit-campaign-place'}]as const)run=apply(run,action);return run;}
function backToOffice(){let run=opening();for(const action of [{type:'choose-direction',direction:'south'},{type:'steps',amount:10},{type:'visit-campaign-place'}]as const)run=apply(run,action);return run;}
test('an actual return after the first delivery reveals a follow-up; clicking visit alone does not',()=>{
 let run=opening();assert(!revisitAvailable(run,'r01'));assert.throws(()=>apply(run,{type:'follow-up',id:'r01',reply:'listen'}));
 run=backToOffice();assert(revisitAvailable(run,'r01'));const returned=run.campaign.returnedAt!.office;
 run=apply(run,{type:'visit-campaign-place'});assert.equal(run.campaign.returnedAt!.office,returned);
 assert.deepEqual(decodeSave(encodeSave(run)),run);
});
test('return choices are saved once, with no repeat XP or dialogue farming',()=>{
 for(const reply of ['listen','brief']as const){let run=backToOffice();const xp=run.campaign.xp,trust=run.campaign.trust.clerk??0;
 run=apply(run,{type:'follow-up',id:'r01',reply});assert.equal(run.campaign.followups?.r01,reply);assert.equal(run.campaign.xp,xp);assert.equal(run.campaign.trust.clerk,trust+(reply==='listen'?1:0));assert(!revisitAvailable(run,'r01'));
 assert.throws(()=>apply(run,{type:'follow-up',id:'r01',reply}));assert.deepEqual(decodeSave(encodeSave(run)),run);}
});
test('follow-ups reject unknown identifiers, invalid choices and unmet later-letter conditions',()=>{
 const run=backToOffice();assert(!revisitAvailable(run,'r02'));assert(!revisitAvailable(run,'r03'));assert.throws(()=>apply(run,{type:'follow-up',id:'unknown',reply:'listen'}));
 assert(isAction({type:'follow-up',id:'r01',reply:'listen'}));assert(!isAction({type:'follow-up',id:'r01',reply:'other'}));
});

test('later follow-ups need a return after their own delivery, not any earlier visit',()=>{
 for(const [id,edge,letter]of [['r02','square','s02'],['r03','workshop','n01']]as const){
  const base=opening();const length=edge==='square'?35:50;
  const events=[...base.events,{type:'deliver-item' as const,id:letter}];
  const run={...base,events,navigation:{...base.navigation!,edge,offset:length},campaign:{...base.campaign,returnedAt:{[edge]:0}}};
  assert(!revisitAvailable(run,id));
  assert(revisitAvailable({...run,campaign:{...run.campaign,returnedAt:{[edge]:events.length}}},id));
 }
});
