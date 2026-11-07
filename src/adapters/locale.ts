import type {Locale} from '../content/ui.ts';
export function readLocale():Locale|null {
 try{const value=localStorage.getItem('letmoro.locale.v1');return value==='fr'||value==='en'?value:null;}catch{return null;}
}
export function rememberLocale(locale:Locale){localStorage.setItem('letmoro.locale.v1',locale);}
