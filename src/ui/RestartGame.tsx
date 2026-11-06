import { useState } from 'react';
import type { Locale } from '../content/ui.ts';

export function RestartGame({locale,disabled,erase}:{locale:Locale;disabled:boolean;erase:()=>Promise<void>}) {
  const [confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false),[failed,setFailed]=useState(false);
  const french=locale==='fr';
  async function restart() {
    setBusy(true);setFailed(false);
    try { await erase(); }
    catch { setFailed(true); }
    finally { setBusy(false); }
  }
  return <section className="restart-game">
    {!confirm ? <button className="reset-button" disabled={disabled} onClick={()=>setConfirm(true)}>{french?'Repartir de zéro':'Start over'}</button> : <>
      <p>{french?'Effacer définitivement la partie, le chemin, les lettres, les badges, le journal, les relations et les réglages, ici et dans la sauvegarde en ligne ? Ton compte et ton mot de passe seront conservés. Une connexion est nécessaire si la sauvegarde en ligne est activée.':'Permanently erase this game, paths, letters, badges, journal, relationships and settings, here and in the online save? Your account and password will be kept. A connection is required when online saving is enabled.'}</p>
      <button className="reset-button" disabled={busy||disabled} onClick={()=>{void restart();}}>{busy?(french?'Effacement…':'Erasing…'):(french?'Tout effacer et recommencer':'Erase everything and start again')}</button>
      <button disabled={busy} onClick={()=>{setConfirm(false);setFailed(false);}}>{french?'Annuler':'Cancel'}</button>
      {failed && <p role="alert">{french?'L’effacement n’a pas pu être terminé. Vérifie ta connexion et réessaie.':'Erasure could not be completed. Check your connection and try again.'}</p>}
    </>}
  </section>;
}
