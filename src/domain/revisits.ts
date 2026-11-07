import type {Run} from './prologue.ts';
import {currentNode} from './navigation.ts';
import {characterAt} from './campaign.ts';
export const revisitRules=[
 {id:'r01',place:'office',character:'clerk'},
 {id:'r02',place:'square',character:'host'},
 {id:'r03',place:'workshop',character:'repairer'},
]as const;
export function revisitAvailable(run:Run,id:string){
 const rule=revisitRules.find(item=>item.id===id),place=currentNode(run);
 if(!rule||run.stage!=='campaign'||place!==rule.place||characterAt(run,place)!==rule.character||run.campaign.followups?.[id])return false;
 const returned=run.campaign.returnedAt?.[place];if(returned===undefined)return false;
 const eventIndex=rule.id==='r01'?run.events.findIndex(event=>event.type==='deliver'):run.events.findIndex(event=>event.type==='deliver-item'&&event.id===(rule.id==='r02'?'s02':'n01'));
 return eventIndex>=0&&returned>eventIndex;
}
