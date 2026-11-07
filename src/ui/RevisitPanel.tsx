import {useState} from 'react';
import type {Run,Action} from '../domain/prologue.ts';
import type {OpeningContent} from '../content/narrative.ts';
import {revisitRules,revisitAvailable} from '../domain/revisits.ts';
export function RevisitPanel({run,content,act}:{run:Run;content:OpeningContent;act:(action:Action)=>void}){
 const [selected,setSelected]=useState<string>();
 const rule=revisitRules.find(rule=>content.campaign?.revisits?.[rule.id]&&(revisitAvailable(run,rule.id)||selected===rule.id));
 if(!rule)return null;
 const copy=content.campaign!.revisits![rule.id],reply=run.campaign.followups?.[rule.id];
 return <details className="revisit-conversation"><summary>{copy.title}</summary>{reply?<p role="status">{reply==='listen'?copy.listening:copy.leaving}</p>:<><p>{copy.prompt}</p><button onClick={()=>{setSelected(rule.id);act({type:'follow-up',id:rule.id,reply:'listen'});}}>{copy.listen}</button><button onClick={()=>{setSelected(rule.id);act({type:'follow-up',id:rule.id,reply:'brief'});}}>{copy.brief}</button></>}</details>;
}
