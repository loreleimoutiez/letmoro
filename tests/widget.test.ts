import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apply,createRun} from '../src/domain/prologue.ts';
import {widgetSnapshot} from '../src/domain/widget.ts';
test('widget exposes only discovered geometry and chooses remaining quest distance',()=>{
 const health={status:'ready' as const,count:340,checkedAt:null,dayKey:'2026-01-02|UTC'};
 assert.equal(widgetSnapshot(null,health,'en'),null);
 let run=apply(createRun(100),{type:'enable-navigation'});run=apply(run,{type:'steps',amount:1});
 const snapshot=JSON.parse(widgetSnapshot(run,health,'fr')!);
 assert.equal(snapshot.remaining,1);assert.equal(snapshot.count,340);assert.equal(snapshot.goal,100);
 assert.equal(snapshot.segments.length,1);assert.deepEqual(snapshot.places,[]);
 assert(!('events' in snapshot));assert(!('letters' in snapshot));assert(!('owner' in snapshot));
});
test('a new game can preview its initial path before health access and idle games show the daily goal',()=>{
 const health={status:'empty' as const,count:null,checkedAt:null};
 const initial=JSON.parse(widgetSnapshot(createRun(100),health,'en')!);
 assert.equal(initial.remaining,2);assert.equal(initial.count,null);
 let run=createRun(100);
 for(const action of [{type:'enable-navigation'},{type:'steps',amount:2},{type:'cross'},{type:'accept'},{type:'steps',amount:10},{type:'arrive'},{type:'deliver'},{type:'settle'},{type:'enter-campaign'}] as const)run=apply(run,action);
 const idle=JSON.parse(widgetSnapshot(run,{...health,status:'ready',count:250,dayKey:'2026-01-02|UTC'},'fr')!);
 assert.equal(idle.remaining,null);assert.equal(idle.count,250);assert.equal(idle.goal,100);
});
