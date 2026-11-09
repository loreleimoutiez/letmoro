import type { Stage } from '../domain/prologue.ts';
import type { CharacterId } from '../domain/encounters.ts';
import type { Neighborhood } from '../domain/navigation.ts';
import type { Locale } from './ui.ts';

export type Topic = 'work' | 'pay' | 'directions';
export interface OpeningContent {
  campaign?: CampaignContent;
  job: string;
  rest: string;
  letter: string;
  openedHandover: string;
  destroyedHandover: string;
  scenes?: Partial<Record<Stage, string>>;
  visits?: Record<Neighborhood, { title: string; listen: string; help: string; response: string; task: string; return: string; complete: string; letterOpened?: string; letterDestroyed?: string; returningRecipient?: string }>;
  topics: Record<Topic, { question: string; answer: string; journal: string }>;
  characters: Partial<Record<CharacterId, { name: string; role: string; color: string }>>;
}
// Optional local authoring pack. Its manuscript is deliberately excluded from Git.
const packs = import.meta.glob<Record<Locale, OpeningContent>>('./private/opening.json', { eager: true, import: 'default' });
export function openingContent(locale: Locale): OpeningContent | undefined {
  return packs['./private/opening.json']?.[locale];
}

export interface LetterContent { title: string; offer: string; body: string; delivered: string; deliveredAfterLoss?: string; report: string; question: string; answer: string }
export interface StairContent {
  discover: string; learned: string; review: string; link: string; linkLearned: string;
  requestPrompt: string; diagram: string; meeting: string; decline: string;
  requestOutcomes: Record<'diagram' | 'meeting' | 'declined', string>;
  volunteer: string; volunteerConfirm: string; volunteered: string;
  disclose: string; disclosed: string; correctionReported: string;
  responsePrompt: string; acceptResponse: string; declineResponse: string;
  diagramAccepted: string; meetingAccepted: string; responseDeclined: string;
  journal: Record<string, string>;
}
export interface BelongingsContent {
  discoverRecipient: string; discoverResident: string; learned: string; review: string;
  decisionPrompt: string; clarify: string; abstain: string; guess: string; guessConfirm: string;
  decisions: Record<'clarify' | 'abstain' | 'guess', string>;
  collectionPrompt: string; witness: string;
  outcomes: Record<'clarified' | 'left-open' | 'unauthorized' | 'unanswered', string>;
  returnPrompt: string; acknowledge: string; leave: string;
  acknowledged: string; respected: string; left: string; recall: string;
  journal: Record<string, string>;
}
export interface CampaignContent {
  belongings?: BelongingsContent;
  stairPassage?: StairContent;
  revisits?:Record<string,{title:string;prompt:string;listen:string;brief:string;listening:string;leaving:string}>;
  sidePassage?: {discover:string;learned:string;replyPrompt:string;direct:string;decline:string;directOutcome:string;declineOutcome:string};
  personalReturn?: { prompt: string; listen: string; alive: string; loss: string; aliveJournal?: string; lossJournal?: string };
  conversations?: Record<string, { prompt: string; listen: string; press: string; listening: string; pressing: string }>;
  letters: Record<string, LetterContent>;
  places: Partial<Record<import('../domain/navigation.ts').Place, { title: string; text: string }>>;
  thoughts: { id: string; condition: 'always' | 'alone' | 'company' | 'sealed' | 'opened' | 'cemetery'; text: string }[];
  badges: Record<string, { title: string; description: string }>;
  ending: string;
}
