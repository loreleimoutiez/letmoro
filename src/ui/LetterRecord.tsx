import { useState } from 'react';
import type { Run, Action } from '../domain/prologue.ts';
import type { en } from '../content/ui.ts';

export function LetterRecord({ run, text: t, body, act }: { run: Run; text: typeof en; body?: string; act: (action: Action) => void }) {
  const [confirming, setConfirming] = useState(false);
  const held = !run.letterDestroyed && !run.delivered;
  return <article><h3>{t.courtyardLetter}</h3>
    <p className="status-tag">{run.letterDestroyed ? t.destroyed : run.delivered ? (run.letterOpened ? t.deliveredOpened : t.intact) : run.letterOpened ? t.opened : t.carried}</p>
    <p className="muted">{run.letterOpened ? t.opened : t.unopened}</p>
    {run.letterOpened && <p className="letter-body">{body ?? t.letterUnavailable}</p>}
    {held && !run.letterOpened && !body && <p className="muted">{t.letterUnavailable}</p>}
    {held && <div className="actions">
      {!run.letterOpened && <button disabled={!body} onClick={() => act({ type: 'open-letter' })}>{t.openLetter}</button>}
      {!confirming ? <button onClick={() => setConfirming(true)}>{t.destroyLetter}</button> : <div role="group" aria-label={t.destroyConfirm}><p>{t.destroyConfirm}</p><button onClick={() => { act({ type: 'destroy-letter' }); setConfirming(false); }}>{t.confirmDestroy}</button><button onClick={() => setConfirming(false)}>{t.cancel}</button></div>}
    </div>}
  </article>;
}
