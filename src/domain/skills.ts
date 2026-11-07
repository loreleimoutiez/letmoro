import type {Run} from './prologue.ts';
export type SkillBranch='craft'|'relations'|'community';
export interface Skill {id:string;branch:SkillBranch;tier:1|2;cost:number;effect:'capacity'|'wages'|'delivery-xp'|'sealed-xp'|'listen-trust'|'report-trust'|'gift'|'friend-xp'|'promise-xp'|'discovery-xp'|'honesty-xp'|'community-gift'}
export const skills:readonly Skill[]=[
 {id:'room-in-the-bag',branch:'craft',tier:1,cost:20,effect:'capacity'},
 {id:'paid-practice',branch:'craft',tier:1,cost:20,effect:'wages'},
 {id:'route-routine',branch:'craft',tier:2,cost:45,effect:'delivery-xp'},
 {id:'careful-hands',branch:'craft',tier:2,cost:45,effect:'sealed-xp'},
 {id:'patient-ear',branch:'relations',tier:1,cost:20,effect:'listen-trust'},
 {id:'word-kept',branch:'relations',tier:1,cost:20,effect:'report-trust'},
 {id:'small-kindness',branch:'relations',tier:2,cost:45,effect:'gift'},
 {id:'lasting-bonds',branch:'relations',tier:2,cost:45,effect:'friend-xp'},
 {id:'shared-effort',branch:'community',tier:1,cost:20,effect:'promise-xp'},
 {id:'local-knowledge',branch:'community',tier:1,cost:20,effect:'discovery-xp'},
 {id:'clear-record',branch:'community',tier:2,cost:45,effect:'honesty-xp'},
 {id:'mutual-support',branch:'community',tier:2,cost:45,effect:'community-gift'},
];
export const hasSkill=(run:Run,effect:Skill['effect'])=>skills.some(skill=>skill.effect===effect&&run.campaign.skills?.includes(skill.id));
export const letterCapacity=(run:Run)=>3+(hasSkill(run,'capacity')?1:0);
export const giftBonus=(run:Run)=>(hasSkill(run,'gift')?1:0)+(hasSkill(run,'community-gift')?1:0);
export const skillTreeUnlocked=(run:Run)=>run.events.some(event=>event.type==='accept');
export function visibleSkills(run:Run,branch:SkillBranch){
 if(!skillTreeUnlocked(run))return [];
 const tier=skills.some(skill=>skill.branch===branch&&skill.tier===1&&run.campaign.skills?.includes(skill.id))?2:1;
 return skills.filter(skill=>skill.branch===branch&&(skill.tier===tier||run.campaign.skills?.includes(skill.id)));
}
export function purchaseSkill(run:Run,id:string){
 const skill=skills.find(item=>item.id===id);
 if(!skillTreeUnlocked(run)||!skill||!visibleSkills(run,skill.branch).some(item=>item.id===id)||skills.some(item=>item.branch===skill.branch&&item.tier===skill.tier&&run.campaign.skills?.includes(item.id))||(run.campaign.xp??0)<skill.cost)throw new Error('Skill purchase unavailable');
 return {...run.campaign,xp:(run.campaign.xp??0)-skill.cost,xpSpent:(run.campaign.xpSpent??0)+skill.cost,skills:[...(run.campaign.skills??[]),id]};
}
