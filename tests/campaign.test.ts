import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, createRun } from '../src/domain/prologue.ts';
import type { Run } from '../src/domain/prologue.ts';
import { currentNode, worldGraph } from '../src/domain/navigation.ts';
import type { Place } from '../src/domain/navigation.ts';
import { routeBetween } from '../src/domain/campaign-reducer.ts';
import { letterRules, campaignBadges } from '../src/domain/campaign.ts';
import { decodeSave, encodeSave } from '../src/adapters/save.ts';
import { knownPlaces } from '../src/domain/encounters.ts';
function opening(): Run {
  let run=createRun(100);
  for(const action of [{type:'enable-navigation'},{type:'steps',amount:2},{type:'cross'},{type:'accept'},{type:'steps',amount:10},{type:'arrive'},{type:'deliver'},{type:'settle'},{type:'enter-campaign'},{type:'visit-campaign-place'}] as const)run=apply(run,action);
  return run;
}
function travel(run: Run, target: Place): Run {
  const start=currentNode(run);assert(start);
  for(const id of routeBetween(run,start,target)) {
    const road=worldGraph(run).edges.find(edge=>edge.id===id)!;
    const from=currentNode(run)!;
    if(!run.navigation!.authorized.includes(id))run=apply(run,{type:'chart-route',place:road.from===from?road.to:road.from});
    const opposite={north:'south',south:'north',east:'west',west:'east'} as const;
    run=apply(run,{type:'choose-direction',direction:road.from===from?road.direction:opposite[road.direction]});
    if(!currentNode(run)||currentNode(run)===from)run=apply(run,{type:'steps',amount:road.length});
    assert.equal(currentNode(run),road.from===from?road.to:road.from);
    run=apply(run,{type:'visit-campaign-place'});
  }
  return run;
}
test('the full authored mechanical round supports twenty letters, step-funded returns and replay',()=>{
  let run=opening();
  for(const rule of [...letterRules].sort((a,b)=>a.unlock-b.unlock)) {
    run=travel(run,rule.from);
    run=apply(run,{type:'take-letter',id:rule.id});
    assert.throws(()=>apply(run,{type:'deliver-item',id:rule.id}));
    run=travel(run,rule.to);
    run=apply(run,{type:'deliver-item',id:rule.id});
    run=travel(run,rule.from);
    run=apply(run,{type:'report-item',id:rule.id,honest:true});
  }
  assert.equal(run.delivered,21);
  assert(campaignBadges(run).includes('opening-complete'));
  assert(campaignBadges(run).includes('kept-word'));
  assert.deepEqual(decodeSave(encodeSave(run)),run);
  assert(run.navigation!.odometer! > run.goal*50);
  assert(knownPlaces(run).includes('cemetery'));
  console.log(`Full round: ${(run.navigation!.odometer!/run.goal).toFixed(2)} daily goals walked, including reporting returns.`);
});
test('a sealed personal delivery supports a silent destination and a one-time optional return gift',()=>{
  let run=opening();
  for(const id of ['p01','p02','n01','n02']) { const rule=letterRules.find(rule=>rule.id===id)!;run=travel(run,rule.from);run=apply(run,{type:'decline-letter',id}); }
  run=travel(run,'bridge');run=apply(run,{type:'take-letter',id:'n04'});
  assert(!knownPlaces(run).includes('cemetery'));
  run=travel(run,'cemetery');const before=run.sous;
  run=apply(run,{type:'deliver-item',id:'n04'});
  assert.equal(run.sous,before);assert.equal(run.campaign.letters.n04.opened,false);
  assert(!campaignBadges(run).includes('kept-word'));
  assert.throws(()=>apply(run,{type:'open-item',id:'n04'}));
  run=apply(run,{type:'focus-letter',id:'n04',returning:true});run=travel(run,'bridge');
  run=apply(run,{type:'report-item',id:'n04',honest:true});assert.equal(run.sous,before+5);
  assert.throws(()=>apply(run,{type:'report-item',id:'n04',honest:true}));
  assert(campaignBadges(run).includes('kept-word'));
});
test('opening is private until witnessed; false reports have delayed, local consequences',()=>{
  let run=travel(opening(),'office');run=apply(run,{type:'take-letter',id:'p01'});
  const before=run.campaign.trust.host??0;run=travel(run,'courtyard');run=apply(run,{type:'open-item',id:'p01'});
  assert.equal(run.campaign.trust.host??0,before);
  run=travel(run,'square');run=apply(run,{type:'deliver-item',id:'p01'});assert.equal(run.campaign.trust.host,before-2);
  run=travel(run,'office');run=apply(run,{type:'report-item',id:'p01',honest:false});
  assert.equal(run.campaign.trust.clerk,1);run=apply(run,{type:'decline-letter',id:'p02'});run=travel(run,'square');run=apply(run,{type:'decline-letter',id:'n01'});run=travel(run,'office');
  run=apply(run,{type:'visit-campaign-place'});assert.equal(run.campaign.trust.clerk,-2);
  const after=run.sous;run=apply(run,{type:'visit-campaign-place'});assert.equal(run.sous,after);
});
test('thoughts persist singly and dismissal suppresses offline backlog',()=>{
  let run=travel(opening(),'gate');run=apply(run,{type:'capture-thought',id:'t01'});
  run=travel(run,'garden');assert.throws(()=>apply(run,{type:'capture-thought',id:'t02'}));
  assert.equal(decodeSave(encodeSave(run)).campaign.pendingThought,'t01');
  run=apply(run,{type:'dismiss-thought'});assert.throws(()=>apply(run,{type:'capture-thought',id:'t02'}));
  run=travel(run,'gate');run=apply(run,{type:'capture-thought',id:'t02'});
  assert.deepEqual(run.campaign.thoughts,['t01','t02']);
});
test('refusing employment still offers and resolves all ten personal letters',()=>{
  let run=createRun(100);
  for(const action of [{type:'enable-navigation'},{type:'steps',amount:2},{type:'cross'},{type:'rest'},{type:'enter-campaign'},{type:'visit-campaign-place'}] as const)run=apply(run,action);
  for(const rule of letterRules.filter(rule=>!rule.postal)) {
    // The old unaccepted offer deliberately reappears at the office.
    const start=currentNode(run)!;
    for(const id of routeBetween(run,start,rule.from)) {
      const road=worldGraph(run).edges.find(edge=>edge.id===id)!;const from=currentNode(run)!;
      const opposite={north:'south',south:'north',east:'west',west:'east'} as const;
      if(!run.navigation!.authorized.includes(id))run=apply(run,{type:'chart-route',place:road.from===from?road.to:road.from});
      run=apply(run,{type:'choose-direction',direction:road.from===from?road.direction:opposite[road.direction]});run=apply(run,{type:'steps',amount:road.length});
      if(run.stage==='job'){run=apply(run,{type:'rest'});run=apply(run,{type:'enter-campaign'});}
      run=apply(run,{type:'visit-campaign-place'});
    }
    run=apply(run,{type:'decline-letter',id:rule.id});
  }
  assert(campaignBadges(run).includes('opening-complete'));
  assert.equal(run.sous,0);
  assert(!run.events.some(event=>event.type==='accept'));
});
test('dialogue affects trust once and friendship badges survive a broken relationship',()=>{
  let run=travel(opening(),'office');run=apply(run,{type:'dialogue',character:'clerk',reply:'listen'});
  assert.equal(run.campaign.trust.clerk,1);
  assert.throws(()=>apply(run,{type:'dialogue',character:'clerk',reply:'press'}));
  assert.throws(()=>apply(run,{type:'dialogue',character:'host',reply:'listen'}));
  // Synthetic trusted state isolates relationship loss from journey setup.
  run={...run,campaign:{...run.campaign,trust:{clerk:3}}};run=apply(run,{type:'befriend',character:'clerk'});
  run=apply(run,{type:'take-letter',id:'p01'});run=apply(run,{type:'destroy-item',id:'p01'});run=apply(run,{type:'report-item',id:'p01',honest:true});
  run=apply(run,{type:'take-letter',id:'p02'});run=apply(run,{type:'destroy-item',id:'p02'});
  assert.equal(run.campaign.friends.length,0);assert(campaignBadges(run).includes('first-friend'));
});
test('resolving a second carried letter preserves the focused objective',()=>{
  let run=travel(opening(),'office');run=apply(run,{type:'take-letter',id:'p01'});
  run=travel(run,'square');run=apply(run,{type:'take-letter',id:'n01'});
  run=apply(run,{type:'focus-letter',id:'p01',returning:false});run=apply(run,{type:'destroy-item',id:'n01'});
  assert.equal(run.campaign.focus?.id,'p01');
});
