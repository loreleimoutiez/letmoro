import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import type {Run} from '../domain/prologue.ts';
import type {OpeningContent} from '../content/narrative.ts';
import type {Locale} from '../content/ui.ts';
import {characterAt} from '../domain/campaign.ts';
import {currentNode} from '../domain/navigation.ts';
import {en,fr} from '../content/ui.ts';
export function EncounterScreen({run,locale,content,children}:{run:Run;locale:Locale;content?:OpeningContent;children:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null),[closed,setClosed]=useState(false);
 const node=currentNode(run),key=`${run.stage}:${node}:${run.campaign.focus?.id??''}`;
 useEffect(()=>{setClosed(false);dialog.current?.showModal();},[key]);
 const person=node?characterAt(run,node):undefined;
 const character=person?content?.characters[person as keyof OpeningContent['characters']]:undefined;
 const t=locale==='fr'?fr:en;
 return <><button className="encounter-open" onClick={()=>{setClosed(false);dialog.current?.showModal();}}>{locale==='fr'?'Ouvrir la rencontre':'Open encounter'}</button><dialog className="encounter-dialog" ref={dialog} onClose={()=>setClosed(true)} aria-label={t.story} data-dismissed={closed}>
 <header><p className="muted">{node?t.places[node]:t.story}</p><div className="encounter-cast"><span><i style={{background:'#fff'}}/>Moro</span>{character&&<span><i style={{background:character.color}}/>{character.name}</span>}</div></header>
 <div className="encounter-body">{children}</div><footer><button onClick={()=>dialog.current?.close()}>{locale==='fr'?'Revenir au chemin':'Return to the path'}</button></footer></dialog></>;
}
