import { useState } from 'react';
import { incompatible, modes, negativeTraits, parseProfile, positiveTraits } from '../domain/profile.ts';
import type { Mode, Profile } from '../domain/profile.ts';
import type { en } from '../content/ui.ts';

export function Setup({ text: t, start }: { text: typeof en; start: (goal: number, profile: Profile) => void }) {
  const [goal, setGoal] = useState('5000');
  const [mode, setMode] = useState<Mode>('standard');
  const [positive, setPositive] = useState<string[]>([]);
  const [negative, setNegative] = useState<string[]>([]);
  const valid = positive.length === 3 && negative.length === 3 && !incompatible(positive, negative);
  const toggle = (items: string[], trait: string) => items.includes(trait) ? items.filter(item => item !== trait) : [...items, trait];
  return <form className="setup" onSubmit={event => {
    event.preventDefault();
    const value = Number(goal);
    if (valid && Number.isSafeInteger(value) && value >= 1 && value <= 100000) start(value, parseProfile({ mode, positive, negative }));
  }}>
    <h1>{t.begin}</h1>
    <label htmlFor="goal">{t.goal}</label><input id="goal" type="number" min="1" max="100000" step="1" required value={goal} onChange={event => setGoal(event.target.value)} />
    <fieldset><legend>{t.difficulty}</legend>{modes.map(item => <label key={item}><input type="radio" name="mode" value={item} checked={mode === item} onChange={() => setMode(item)} />{t[item]}</label>)}</fieldset>
    {([['positive', positiveTraits, positive, setPositive, t.positive], ['negative', negativeTraits, negative, setNegative, t.negative]] as const).map(([kind, traits, selected, change, title]) => <fieldset key={kind}><legend>{title} · {selected.length}/3</legend><div className="trait-grid">{traits.map(trait => {
      const checked = selected.includes(trait);
      const next = toggle(selected, trait);
      const blocked = !checked && (selected.length >= 3 || incompatible(kind === 'positive' ? next : positive, kind === 'negative' ? next : negative));
      return <label key={trait}><input type="checkbox" checked={checked} disabled={blocked} onChange={() => change(next)} />{t.traits[trait]}</label>;
    })}</div></fieldset>)}
    <p className="muted">{t.setupNote}</p><button type="submit" disabled={!valid}>{t.begin}</button>
  </form>;
}
