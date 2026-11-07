import {test} from 'node:test';
import assert from 'node:assert/strict';
import {apply,createRun} from '../src/domain/prologue.ts';
import {journeyFor,tourFor} from '../src/domain/journey.ts';
import {widgetSnapshot} from '../src/domain/widget.ts';
test('the objective follows actual remaining travel, including a reversal',()=>{
 let run=apply(createRun(1000),{type:'enable-navigation'});
 run=apply(run,{type:'steps',amount:10});
 assert.equal(journeyFor(run)?.kind,'job');
 assert.equal(journeyFor(run)?.remaining,10);
 run=apply(run,{type:'choose-direction',direction:'west'});
 run=apply(run,{type:'steps',amount:5});
 assert.equal(journeyFor(run)?.remaining,15);
 assert.equal(journeyFor(run)?.heading,'west');
});
test('the tour notebook counts the first held letter and removes it on delivery',()=>{
 let run=apply(createRun(100),{type:'enable-navigation'});
 for(const action of [{type:'steps',amount:2},{type:'cross'},{type:'accept'}] as const)run=apply(run,action);
 assert.equal(tourFor(run).carried,1);
 assert.equal(journeyFor(run)?.kind,'delivery');
 const snapshot=JSON.parse(widgetSnapshot(run,{status:'empty',count:null,checkedAt:null},'en')!);
 assert.match(snapshot.notebook,/1 letter/);
 assert(!('body' in snapshot));
 for(const action of [{type:'steps',amount:10},{type:'arrive'},{type:'deliver'}] as const)run=apply(run,action);
 assert.equal(tourFor(run).carried,0);
});
