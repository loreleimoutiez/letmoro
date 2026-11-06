import type { Stage } from '../domain/prologue.ts';
import type { CharacterId } from '../domain/encounters.ts';
import type { Neighborhood } from '../domain/navigation.ts';
import type { Locale } from './ui.ts';

export type Topic = 'work' | 'pay' | 'directions';
export interface OpeningContent {
  job: string;
  rest: string;
  letter: string;
  openedHandover: string;
  destroyedHandover: string;
  scenes?: Partial<Record<Stage, string>>;
  visits?: Record<Neighborhood, { title: string; listen: string; help: string; response: string; task: string; return: string; complete: string; letterOpened?: string; letterDestroyed?: string; returningRecipient?: string }>;
  topics: Record<Topic, { question: string; answer: string; journal: string }>;
  characters: Record<CharacterId, { name: string; role: string; color: string }>;
}
// Optional local authoring pack. Its manuscript is deliberately excluded from Git.
const packs = import.meta.glob<Record<Locale, OpeningContent>>('./private/opening.json', { eager: true, import: 'default' });
export function openingContent(locale: Locale): OpeningContent | undefined {
  return packs['./private/opening.json']?.[locale];
}
