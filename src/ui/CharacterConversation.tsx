import {useState} from 'react';
import type {Action} from '../domain/prologue.ts';
import type {CampaignContent} from '../content/narrative.ts';
import type {Locale} from '../content/ui.ts';
type Conversation=NonNullable<CampaignContent['conversations']>[string];
export function CharacterConversation({conversation,person,reply,locale,act}:{conversation:Conversation;person:string;reply?:'listen'|'press';locale:Locale;act:(action:Action)=>void}){
 const [answered,setAnswered]=useState(false);
 const response=reply==='listen'?conversation.listening:conversation.pressing;
 return <article>{reply?answered?<p role="status">{response}</p>:<details><summary>{locale==='fr'?'Relire notre échange':'Recall our conversation'}</summary><p>{response}</p></details>:<><p>{conversation.prompt}</p>{(['listen','press']as const).map(choice=><button key={choice} onClick={()=>{setAnswered(true);act({type:'dialogue',character:person,reply:choice});}}>{conversation[choice]}</button>)}</>}</article>;
}
