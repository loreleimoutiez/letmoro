import type {Run,Action} from '../domain/prologue.ts';
import type {OpeningContent} from '../content/narrative.ts';
import type {Locale} from '../content/ui.ts';
import {en,fr} from '../content/ui.ts';
import {journeyFor,tourFor} from '../domain/journey.ts';
import {journeyCopy} from '../content/journey.ts';
export function JourneyReminder({run,locale,content,act,compact=false,open}:{run:Run;locale:Locale;content?:OpeningContent;act?:(action:Action)=>void;compact?:boolean;open?:()=>void}){
 const journey=journeyFor(run),french=locale==='fr',t=french?fr:en;
 if(!journey){const bag=tourFor(run).carried;return <div className={compact?'journey-reminder':'journey-card'}><p>{french?'Exploration libre':'Free exploration'}</p><p className="muted">{bag?french?`${bag} lettre(s) en sac. Choisis un objectif dans le carnet de tournée.`:`${bag} letter(s) carried. Choose an objective in the tour notebook.`:french?'Aucune livraison sélectionnée. Tu peux explorer les chemins disponibles.':'No delivery selected. You can explore the available paths.'}</p>{open&&<button onClick={open}>{french?'Voir la tournée':'View the tour'}</button>}</div>;}
 const copy=journeyCopy(run,journey,locale,content);
 return <div className={compact?'journey-reminder':'journey-card'} aria-label={french?'Objectif actuel':'Current objective'}><p>{copy.title}</p><p className="muted">{copy.destination} · {journey.remaining.toLocaleString(locale)} {french?'pas restants':'steps remaining'}</p>{!compact&&<p>{copy.instruction}</p>}
 {act&&journey.remaining>0&&journey.nextDirection&&<button onClick={()=>act({type:'choose-direction',direction:journey.nextDirection!})}>{french?'Prendre la direction':'Take the direction'} {t.directions[journey.nextDirection]}</button>}
 {compact&&<p className="muted">{journey.heading?t.directions[journey.heading]:journey.nextDirection?`${french?'Choisir':'Choose'} ${t.directions[journey.nextDirection]}`:copy.instruction}</p>}{open&&<button onClick={open}>{french?'Voir la tournée':'View the tour'}</button>}
 </div>;
}
