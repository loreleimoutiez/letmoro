import { encountersFor } from './encounters.ts';
import { recordText } from '../content/records.en.ts';
import type { Run } from './prologue.ts';

// Derive discovery from saved events; never reveal future content or letter text.
export function recordsFor(run: Run) {
  const happened = (type: string) => run.events.some(event => event.type === type);
  const employed = happened('accept');
  return {
    letters: employed ? [{ id: 'courtyard-letter', title: recordText.courtyardLetter.title, opened: run.letterOpened, destroyed: run.letterDestroyed,
      status: run.letterDestroyed ? 'Destroyed' : happened('deliver') ? (run.letterOpened ? 'Delivered opened' : recordText.courtyardLetter.delivered) : (run.letterOpened ? 'Carried, opened' : recordText.courtyardLetter.carried) }] : [],
    characters: [...new Map(encountersFor(run).map(encounter => [encounter.character, encounter])).values()].map(encounter => ({ id: encounter.character, ...recordText[encounter.character], lastKnownPlace: encounter.place })),
    skills: employed ? [{ id: 'basic-respect' as const }] : [],
    badges: [{ id: 'first-job', title: employed ? recordText.firstJob.title : null,
      description: employed ? recordText.firstJob.description : null },
      ...([['first-delivery', 'deliver', recordText.firstDelivery], ['first-opening', 'open-letter', recordText.firstOpening], ['first-destruction', 'destroy-letter', recordText.firstDestruction]] as const).filter(([, event]) => happened(event)).map(([id, , text]) => ({ id, title: text.title, description: text.description }))],
  };
}
