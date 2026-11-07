import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apply,createRun,isAction} from '../src/domain/prologue.ts';
import {skills,visibleSkills,purchaseSkill,letterCapacity,hasSkill,giftBonus} from '../src/domain/skills.ts';
import {experienceAward,deliveryXP} from '../src/domain/experience.ts';
import {decodeSave,encodeSave} from '../src/adapters/save.ts';
function employed(){let run=apply(createRun(100),{type:'enable-navigation'});for(const action of [{type:'steps',amount:2},{type:'cross'},{type:'accept'}]as const)run=apply(run,action);return run;}
test('skills stay hidden before employment and never spend unavailable XP',()=>{
 const run=createRun(100);assert.throws(()=>purchaseSkill({...run,campaign:{...run.campaign,xp:100}},'room-in-the-bag'));
 assert.throws(()=>apply(employed(),{type:'buy-skill',id:'room-in-the-bag'}));
 assert(isAction({type:'buy-skill',id:'room-in-the-bag'}));assert(!isAction({type:'buy-skill'}));
});
test('each branch reveals exactly two choices, enforces prerequisites and excludes its sibling',()=>{
 let run=employed();run={...run,campaign:{...run.campaign,xp:100}};
 assert.equal(visibleSkills(run,'craft').length,2);
 assert.throws(()=>purchaseSkill(run,'careful-hands'));
 run=apply(run,{type:'buy-skill',id:'room-in-the-bag'});
 assert.equal(run.campaign.xp,80);assert.equal(run.campaign.xpSpent,20);assert.equal(letterCapacity(run),4);
 assert.deepEqual(visibleSkills(run,'craft').map(item=>item.id),['room-in-the-bag','route-routine','careful-hands']);
 assert.throws(()=>apply(run,{type:'buy-skill',id:'paid-practice'}));
 assert.throws(()=>apply(run,{type:'buy-skill',id:'room-in-the-bag'}));
 run=apply(run,{type:'buy-skill',id:'careful-hands'});assert.equal(run.campaign.xp,35);assert.equal(run.campaign.xpSpent,65);
 assert(hasSkill(run,'sealed-xp'));assert.throws(()=>apply(run,{type:'buy-skill',id:'route-routine'}));
});
test('XP rewards differ by mission, respect held-letter state, and apply actual skill effects',()=>{
 let run=employed();assert.equal(experienceAward(run,{type:'deliver'}),12);
 assert(deliveryXP('p10')>deliveryXP('p01'));assert.equal(deliveryXP('n04'),45);
 assert.equal(experienceAward(run,{type:'ask',topic:'work'}),0);
 assert.equal(experienceAward(run,{type:'report-item',id:'n01',honest:true}),0);
 run={...run,campaign:{...run.campaign,skills:['route-routine','careful-hands','small-kindness','mutual-support']}};
 assert.equal(experienceAward(run,{type:'deliver'}),22);
 assert.equal(experienceAward({...run,letterOpened:true},{type:'deliver'}),16);assert.equal(giftBonus(run),2);
});
test('earned XP and purchases survive deterministic replay, including older content saves',()=>{
 let run=employed();for(const action of [{type:'steps',amount:10},{type:'arrive'},{type:'deliver'},{type:'settle'},{type:'enter-campaign'},{type:'visit-campaign-place'}]as const)run=apply(run,action);
 assert.equal(run.campaign.xp,17);
 for(const action of [{type:'choose-direction',direction:'south'},{type:'steps',amount:10},{type:'visit-campaign-place'}]as const)run=apply(run,action);
 assert.equal(run.campaign.xp,22);
 run=apply(run,{type:'buy-skill',id:'room-in-the-bag'});
 const saved=encodeSave(run);const restored=decodeSave(saved);assert.deepEqual(restored,run);
 assert.equal(restored.campaign.xp,2);assert.equal(restored.campaign.xpSpent,20);assert.equal(letterCapacity(restored),4);
 assert.deepEqual(decodeSave(JSON.stringify({...JSON.parse(saved),content:'prologue-7'})),run);
 assert.equal(skills.length,12);
});
