import type {Action,Run} from './prologue.ts';
import {allLetterRules as letterRules} from './campaign.ts';
import {currentNode} from './navigation.ts';
import {hasSkill} from './skills.ts';
const sideDeliveryXP: Readonly<Record<string, number>> = { s01: 32, s02: 18, s03: 24, s04: 30, s05: 30, s06: 22, s07: 22, s08: 18 };
export function deliveryXP(id: string): number {
  const rule = letterRules.find(item => item.id === id);
  if (!rule) return 0;
  return sideDeliveryXP[id] ?? (id === 'n04' ? 45 : 18 + Math.floor(rule.unlock / 2) * 3 + (rule.postal ? 0 : 4));
}
/** Called only after action validation. Replay restores old accomplishments once. */
export function experienceAward(run:Run,action:Action):number {
 const promise=hasSkill(run,'promise-xp')?5:0;
 switch(action.type){
 case 'report-loss':return 6;
 case 'deliver': return 12+(hasSkill(run,'delivery-xp')?4:0)+(!run.letterOpened&&hasSkill(run,'sealed-xp')?6:0);
 case 'finish-errand':return run.errand&&!run.completedErrands.includes(run.errand.from)?(run.errand.from==='square'?35:40)+promise:0;
 case 'deliver-item':return deliveryXP(action.id)+(hasSkill(run,'delivery-xp')?4:0)+(!run.campaign.letters[action.id]?.opened&&hasSkill(run,'sealed-xp')?6:0);
 case 'report-item':return action.honest?(run.campaign.letters[action.id]?.status==='delivered'?8+promise+(hasSkill(run,'honesty-xp')?5:0):run.campaign.letters[action.id]?.status==='destroyed'?3:0):0;
 case 'complete-private-return':return run.campaign.letters[action.id]?.opened?0:25+promise+(hasSkill(run,'honesty-xp')?5:0);
 case 'return-item':return 4;
 case 'befriend':return run.events.some(event=>event.type==='befriend'&&event.character===action.character)?0:10+(hasSkill(run,'friend-xp')?10:0);
 case 'visit-campaign-place':{const place=currentNode(run);return place&&!run.campaign.visited.includes(place)?5+(hasSkill(run,'discovery-xp')?5:0):0;}
 default:return 0;
 }
}
