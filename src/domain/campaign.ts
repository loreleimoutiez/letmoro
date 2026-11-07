import type { Run } from './prologue.ts';
import type { Place } from './navigation.ts';

export interface LetterRule { id: string; from: Place; to: Place; sender: string; recipient: string; unlock: number; postal: boolean; pay: number; gift: number }
// Versioned mechanical catalog. Authored text and narrative secrets live in the private pack.
type RuleRow = readonly [id: string, from: Place, to: Place, sender: string, recipient: string, unlock: number, postal: 0 | 1, pay: number, gift: number];
const ruleRows: readonly RuleRow[] = [
  ['p01','office','square','clerk','host',0,1,8,0], ['n01','square','workshop','host','repairer',0,0,0,2],
  ['p02','office','gate','clerk','keeper',1,1,8,0], ['n02','workshop','courtyard','repairer','recipient',1,0,0,2],
  ['p03','office','garden','clerk','host',3,1,10,0], ['n03','courtyard','office','recipient','clerk',2,0,0,1],
  ['p04','office','bridge','clerk','traveler',4,1,12,0], ['n04','bridge','cemetery','traveler','memory',4,0,0,5],
  ['p05','office','relay','clerk','keeper',6,1,12,0], ['n05','gate','square','keeper','host',5,0,0,2],
  ['p06','office','workshop','clerk','repairer',8,1,10,0], ['n06','relay','office','host','clerk',7,0,0,3],
  ['p07','office','ridge','clerk','archivist',10,1,14,0], ['n07','ridge','courtyard','archivist','recipient',9,0,0,3],
  ['p08','office','reservoir','clerk','keeper',12,1,14,0], ['n08','garden','bridge','host','traveler',11,0,0,3],
  ['p09','office','courtyard','clerk','recipient',14,1,10,0], ['n09','reservoir','relay','keeper','host',13,0,0,3],
  ['p10','office','square','clerk','host',16,1,12,0], ['n10','square','office','host','clerk',15,0,0,4],
];
export const letterRules: readonly LetterRule[] = ruleRows.map(([id, from, to, sender, recipient, unlock, postal, pay, gift]) => ({
  id, from, to, sender, recipient, unlock, postal: postal === 1, pay, gift,
}));
export interface EntrustedLetter { opened: boolean; deliveredTo?: string; senderWitnessed?: 'opened' | 'destroyed'; status: 'carried' | 'delivered' | 'destroyed' | 'returned' | 'declined'; reported: boolean; returnOutcome?: 'alive' | 'loss'; honest?: boolean }
export interface Campaign {
  readonly active: boolean;
  readonly xp?: number;
  readonly xpSpent?: number;
  readonly skills?: readonly string[];
  readonly completed?: boolean;
  readonly replies?: Readonly<Record<string, 'listen' | 'press'>>;
  readonly encounters?: readonly { character: string; place: Place; event: number }[];
  readonly letters: Readonly<Record<string, EntrustedLetter>>;
  readonly trust: Readonly<Record<string, number>>;
  readonly friends: readonly string[];
  readonly visited: readonly Place[];
  readonly focus?: { id: string; returning: boolean };
  readonly delayed: readonly { id: string; due: number; settled: boolean }[];
  readonly lastOutcome?: 'delivered' | 'opened-delivery' | 'destroyed' | 'returned' | 'reported' | 'lie' | 'contradiction' | 'friend' | 'placed' | 'personal-return' | 'personal-loss';
  readonly pendingThought?: string;
  readonly lastThought?: string;
  readonly thoughtMark: number;
  readonly thoughts: readonly string[];
}
export type CampaignAction = { type: 'enter-campaign' } | { type: 'visit-campaign-place' } | { type: 'chart-route'; place: Place } |
  { type: 'take-letter' | 'decline-letter' | 'open-item' | 'destroy-item' | 'deliver-item' | 'return-item' | 'complete-private-return'; id: string } |
  { type: 'focus-letter'; id: string; returning: boolean } | { type: 'report-item'; id: string; honest: boolean } |
  { type: 'dialogue'; character: string; reply: 'listen' | 'press' } | { type: 'befriend'; character: string } | { type: 'capture-thought'; id: string } | { type: 'dismiss-thought' };
export const peopleAt: Partial<Record<Place, string>> = { office:'clerk',courtyard:'recipient',square:'host',workshop:'repairer',garden:'host',gate:'keeper',bridge:'traveler',relay:'host',ridge:'archivist',reservoir:'keeper' };
export function characterAt(run: Run, place: Place): string | undefined {
  const letter=run.campaign.letters.n04;
  return place==='bridge' && (letter?.returnOutcome==='loss' || letter?.status==='delivered' && letter.opened && !letter.reported) ? 'witness' : peopleAt[place];
}
export function initialCampaign(): Campaign { return { active:false, letters:{}, trust:{}, friends:[], visited:[], delayed:[], thoughtMark:0, thoughts:[] }; }
export function resolvedLetters(run: Run): number { return Object.values(run.campaign.letters).filter(letter => letter.status !== 'carried').length; }
export function campaignBadges(run: Run): string[] {
  const entries = Object.entries(run.campaign.letters), delivered = entries.filter(([,letter]) => letter.status === 'delivered');
  return [
    ...(run.delivered >= 3 ? ['three-deliveries'] : []), ...(run.delivered >= 10 ? ['ten-deliveries'] : []),
    ...(delivered.filter(([,letter]) => !letter.opened).length >= 5 ? ['five-sealed'] : []),
    ...(entries.some(([,letter]) => letter.status === 'returned') ? ['honest-return'] : []),
    ...(entries.some(([,letter]) => letter.opened && letter.reported && letter.honest) ? ['honest-confession'] : []),
    ...(run.events.some(event=>event.type==='befriend') ? ['first-friend'] : []),
    ...((run.navigation?.odometer ?? 0) >= run.goal * 5 ? ['long-walk'] : []),
    ...(run.campaign.letters.n04?.status === 'delivered' ? ['quiet-delivery'] : []),
    ...(run.campaign.letters.n04?.status === 'delivered' && !run.campaign.letters.n04.opened ? ['unread-promise'] : []),
    ...(run.campaign.letters.n04?.status === 'delivered' && run.campaign.letters.n04.reported && run.campaign.letters.n04.honest ? ['kept-word'] : []),
    ...(run.campaign.delayed.some(item => item.settled) ? ['paper-trail'] : []),
    ...(entries.filter(([,letter]) => letter.status === 'declined').length >= 3 ? ['boundaries'] : []),
    ...(campaignComplete(run) ? ['opening-complete'] : []),
  ];
}
export function campaignComplete(run: Run): boolean {
  const employed = run.events.some(event => event.type === 'accept');
  return Boolean(run.campaign.completed) || letterRules.filter(rule => employed || !rule.postal).every(rule => {
    const item = run.campaign.letters[rule.id];
    return item && item.status !== 'carried';
  });
}
export function availableLetters(run: Run, place: Place): LetterRule[] {
  const employed = run.events.some(event => event.type === 'accept');
  const personal = letterRules.filter(rule => !rule.postal);
  return letterRules.filter(rule => {
    const unlock = !employed && !rule.postal ? personal.findIndex(item => item.id === rule.id) : rule.unlock;
    return rule.from === place && !run.campaign.letters[rule.id] && unlock <= resolvedLetters(run) && (!rule.postal || employed);
  });
}
