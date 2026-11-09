import { belongingsSceneHere } from '../domain/belongings.ts';
import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import type {Run} from '../domain/prologue.ts';
import type {OpeningContent} from '../content/narrative.ts';
import type {Locale} from '../content/ui.ts';
import {allLetterRules as letterRules,characterAt} from '../domain/campaign.ts';
import {currentNode} from '../domain/navigation.ts';
import {en,fr} from '../content/ui.ts';
export function EncounterScreen({run,locale,content,children}:{run:Run;locale:Locale;content?:OpeningContent;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),[closed,setClosed]=useState(false);
 const node=currentNode(run),key=`${run.stage}:${node}:${run.campaign.focus?.id??''}`;
 useEffect(()=>{setClosed(false);dialog.current?.showModal();},[key]);
 const person=node?characterAt(run,node):undefined;
 const ids=new Set<string>(person?[person]:[]);
 if (belongingsSceneHere(run)) ids.add('recipient');
 if(run.stage==='square'&&run.events.some(event=>event.type==='arrive'))ids.add('recipient');
 if(run.stage==='campaign')for(const rule of letterRules){
   const item=run.campaign.letters[rule.id];
   if(rule.to===node&&rule.recipient!=='memory'&&item?.status==='carried')ids.add(node==='bridge'&&person==='witness'?'witness':rule.recipient);
 }
 const characters=[...ids].flatMap(id=>{const character=content?.characters[id as keyof OpeningContent['characters']];return character?[character]:[];});
 const t=locale==='fr'?fr:en;
 return <><button className="encounter-open" onClick={()=>{setClosed(false);dialog.current?.showModal();}}>{locale==='fr'?'Ouvrir la rencontre':'Open encounter'}</button><dialog className="encounter-dialog" ref={dialog} onClose={()=>setClosed(true)} aria-label={t.story} data-dismissed={closed}>
 <header><p className="muted">{node?t.places[node]:t.story}</p><div className="encounter-cast"><span><i style={{background:'#fff'}}/>Moro</span>{characters.map(character=><span key={character.name}><i style={{background:character.color}}/>{character.name}</span>)}</div></header>
 <div className="encounter-body">{children}</div><footer><button onClick={()=>dialog.current?.close()}>{locale==='fr'?'Revenir au chemin':'Return to the path'}</button></footer></dialog></>;
}
