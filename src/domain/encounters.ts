import type { Run } from './prologue.ts';
import type { Place } from './navigation.ts';
export type CharacterId = 'clerk' | 'recipient' | 'host' | 'repairer' | 'keeper' | 'traveler' | 'archivist' | 'witness';
export interface Encounter { character: CharacterId; place: Place; event: number }
export function encountersFor(run: Run): Encounter[] {
  return run.events.flatMap((event, index): Encounter[] => {
    if (event.type === 'cross') return [{ character: 'clerk', place: 'office', event: index }];
    if (event.type === 'arrive') return [{ character: 'recipient', place: 'courtyard', event: index }];
    if (event.type === 'meet-place') return event.place === 'square'
      ? [{ character: 'host', place: 'square', event: index }, ...(run.events.slice(0, index).some(item => item.type === 'arrive') ? [{ character: 'recipient' as const, place: 'square' as const, event: index }] : [])]
      : [{ character: 'repairer', place: 'workshop', event: index }];
    return [];
  }).concat((run.campaign.encounters ?? []).map(encounter => ({...encounter,character:encounter.character as CharacterId})));
}
export function encounterMarkers(run: Run) {
  const history = encountersFor(run), last = new Map<CharacterId, Encounter>();
  for (const encounter of history) last.set(encounter.character, encounter);
  const seen = new Set<string>();
  return history.filter(encounter => {
    const key = `${encounter.character}:${encounter.place}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).map(encounter => ({ ...encounter, latest: last.get(encounter.character)?.place === encounter.place }));
}

export function knownPlaces(run: Run): Place[] {
  const known = new Set([...encountersFor(run).map(encounter => encounter.place), ...run.campaign.visited]);
  let conversation: 'square' | 'workshop' | undefined;
  let destination: 'garden' | 'gate' | undefined;
  for (const event of run.events) {
    if (event.type === 'meet-place') conversation = event.place;
    if (event.type === 'reply' && event.reply === 'help' && conversation) destination = conversation === 'square' ? 'garden' : 'gate';
    if (event.type === 'inspect' && destination) known.add(destination);
    if (event.type === 'finish-errand') destination = undefined;
  }
  return [...known];
}
