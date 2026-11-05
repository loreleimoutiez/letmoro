import { recordText } from '../content/records.en.ts';
import type { Run } from './prologue.ts';

// Derive discovery from saved events; never reveal future content or letter text.
export function recordsFor(run: Run) {
  const happened = (type: string) => run.events.some(event => event.type === type);
  const employed = happened('accept');
  return {
    letters: employed ? [{ id: 'courtyard-letter', title: recordText.courtyardLetter.title, opened: false,
      status: happened('deliver') ? recordText.courtyardLetter.delivered : recordText.courtyardLetter.carried }] : [],
    characters: [
      ...(happened('cross') ? [{ id: 'clerk', ...recordText.clerk }] : []),
      ...(happened('arrive') ? [{ id: 'recipient', ...recordText.recipient }] : []),
    ],
    badges: [{ id: 'first-job', title: employed ? recordText.firstJob.title : recordText.secretBadge,
      description: employed ? recordText.firstJob.description : null }],
  };
}
