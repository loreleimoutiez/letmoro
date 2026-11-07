import {useState} from 'react';
import {readLocale,rememberLocale} from '../adapters/locale.ts';
import type {Locale} from '../content/ui.ts';
import type {ReactNode} from 'react';
export function LanguageArrival({children}:{children:(locale:Locale,explicit:boolean)=>ReactNode}){
 const [locale,setLocale]=useState(readLocale),[explicit,setExplicit]=useState(false);
 if(locale)return children(locale,explicit);
 function choose(value:Locale){try{rememberLocale(value);}catch{/* Keep the choice for this session if storage is unavailable. */}setExplicit(true);setLocale(value);}
 return <main className="language-arrival"><span className="language-moro" aria-hidden="true"/><h1><span lang="fr">Choisis ta langue</span><span lang="en">Choose your language</span></h1><div><button lang="fr" onClick={()=>choose('fr')}>Français</button><button lang="en" onClick={()=>choose('en')}>English</button></div></main>;
}
