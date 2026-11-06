import { useState } from 'react';
import type { Action, Run } from '../domain/prologue.ts';
import type { Locale } from '../content/ui.ts';

export function RestSettings({ run, locale, act }: { run: Run; locale: Locale; act: (action: Action) => void }) {
  const latest = run.life.schedules?.at(-1);
  const [days, setDays] = useState<number[]>([...(latest?.weekdays ?? [])]);
  const allowance = run.profile?.mode === 'hard' ? 1 : 2, french = locale === 'fr';
  if (run.profile?.mode === 'free' || !run.life.calendar) return null;
  const availableAt = latest ? Date.parse(latest.requestedAt) + 7 * 86400000 : 0;
  const locked = Date.now() < availableAt || run.life.lives === 0;
  return <fieldset className="rest-settings"><legend>{french ? 'Jours de repos' : 'Rest weekdays'}</legend>
    <p>{french ? `Choisis ${allowance} jour(s). Effet le lundi suivant, sept jours entre modifications.` : `Choose ${allowance} day(s). Effective next Monday, seven days between changes.`}</p>
    <div className="weekday-options">{[1,2,3,4,5,6,0].map(day => <label key={day}><input type="checkbox" checked={days.includes(day)} disabled={locked || (!days.includes(day) && days.length >= allowance)} onChange={() => setDays(values => values.includes(day) ? values.filter(value => value !== day) : [...values, day])} />{new Intl.DateTimeFormat(locale, { weekday:'short',timeZone:'UTC' }).format(new Date(Date.UTC(2026,0,4+day)))}</label>)}</div>
    {latest && <p className="muted">{french ? 'Planning enregistré, à compter du' : 'Saved schedule, effective'} {latest.effective}. {locked && `${french ? 'Modifiable après le' : 'Changes available after'} ${new Date(availableAt).toLocaleString(locale)}`}</p>}
    <button disabled={locked || days.length !== allowance} onClick={() => act({type:'set-rest-days', weekdays:days, requestedAt:new Date().toISOString()})}>{french ? 'Enregistrer les jours' : 'Save weekdays'}</button>
  </fieldset>;
}
