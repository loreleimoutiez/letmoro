import {useState} from 'react';
import type {Run,Action} from '../domain/prologue.ts';
import type {Locale} from '../content/ui.ts';
import {skills,visibleSkills,skillTreeUnlocked} from '../domain/skills.ts';
import type {SkillBranch} from '../domain/skills.ts';
import {skillCopy,branchCopy} from '../content/skills.ts';
export function SkillTree({run,locale,act}:{run:Run;locale:Locale;act:(action:Action)=>void}){
 const french=locale==='fr', [selected,setSelected]=useState<string>();
 if(!skillTreeUnlocked(run))return <section><h1>{french?'Expérience':'Experience'}</h1><p>{run.campaign.xp??0} XP</p><p>{french?'L’arbre de compétences se dévoilera après l’acceptation du travail.':'The skill tree will be revealed after accepting the job.'}</p></section>;
 const owned=run.campaign.skills??[],balance=run.campaign.xp??0,chosen=skills.find(skill=>skill.id===selected);
 const locked=chosen&&skills.some(skill=>skill.branch===chosen.branch&&skill.tier===chosen.tier&&owned.includes(skill.id));
 const copy=chosen?skillCopy(chosen.id,locale):undefined;
 return <section className="skills-page"><h1>{french?'Compétences':'Skills'}</h1><p>{balance} XP {french?'disponibles':'available'} · {run.campaign.xpSpent??0} {french?'dépensées':'spent'}</p><p className="muted">{french?'À chaque palier, choisis une compétence parmi deux. L’achat dévoile la suite de cette branche. Ce choix est définitif pour cette partie.':'At each tier, choose one of two skills. Purchasing reveals the next tier in that branch. Your choice is permanent for this run.'}</p>
 <p className="muted skill-pan-hint">{french?'Fais glisser l’arbre horizontalement pour parcourir les trois branches.':'Swipe the tree horizontally to explore its three branches.'}</p><div className="skill-tree" tabIndex={0} aria-label={french?'Arbre de compétences, défilement horizontal':'Skill tree, scroll horizontally'}><div className="skill-trunk"><i/>{french?'Respect basique':'Basic respect'}<small>{french?'Travail accepté':'Job accepted'}</small></div><div className="skill-branches">{(['craft','relations','community'] as SkillBranch[]).map(branch=><div className="skill-branch" key={branch}><h2>{branchCopy(branch,locale)}</h2>{[1,2].map(tier=>{
 const nodes=visibleSkills(run,branch).filter(skill=>skill.tier===tier);if(!nodes.length)return null;
 return <div className="skill-fork" key={tier}>{nodes.map(skill=><button key={skill.id} aria-pressed={selected===skill.id} className={owned.includes(skill.id)?'owned':''} onClick={()=>setSelected(skill.id)}><i aria-hidden="true"/><span>{skillCopy(skill.id,locale)[0]}</span><small>{owned.includes(skill.id)?french?'Acquis':'Owned':`${skill.cost} XP`}</small></button>)}</div>;
 })}</div>)}</div></div>
 {chosen&&copy&&<article className="skill-inspector"><h2>{copy[0]}</h2><p>{copy[1]}</p>{owned.includes(chosen.id)?<p>{french?'Compétence acquise':'Skill owned'}</p>:locked?<p>{french?'Tu as choisi l’autre compétence de ce palier.':'You chose the other skill at this tier.'}</p>:<button disabled={balance<chosen.cost} onClick={()=>act({type:'buy-skill',id:chosen.id})}>{french?'Débloquer pour':'Unlock for'} {chosen.cost} XP</button>}</article>}
 </section>;
}
