import type { Locale } from './ui.ts';

export type Topic = 'work' | 'pay' | 'directions';
export interface OpeningContent {
  job: string;
  rest: string;
  letter: string;
  openedHandover: string;
  destroyedHandover: string;
  topics: Record<Topic, { question: string; answer: string; journal: string }>;
  characters: Record<'clerk' | 'recipient', { name: string; role: string; color: string }>;
}
// Optional local authoring pack. Its manuscript is deliberately excluded from Git.
const packs = import.meta.glob<Record<Locale, OpeningContent>>('./private/opening.json', { eager: true, import: 'default' });
export function openingContent(locale: Locale): OpeningContent | undefined {
  return packs['./private/opening.json']?.[locale];
}
