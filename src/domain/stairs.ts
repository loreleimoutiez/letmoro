import type { Run } from './prologue.ts';
import { currentNode, revealStairPassage, revealStairLink } from './navigation.ts';

export interface StairState {
  readonly passage?: boolean;
  readonly link?: boolean;
  readonly request?: 'diagram' | 'meeting' | 'declined';
  readonly volunteered?: boolean;
  readonly disclosed?: boolean;
  readonly response?: 'accepted' | 'declined';
}
export type StairAction = { type: 'learn-stair-passage' | 'learn-stair-link' | 'volunteer-stair-work' | 'disclose-stair-claim' }
  | { type: 'choose-stair-request'; reply: 'diagram' | 'meeting' | 'declined' }
  | { type: 'resolve-stair-response'; reply: 'accepted' | 'declined' };

export function stairConversationReady(run: Run): boolean {
  return Boolean(run.campaign.stair?.passage && run.campaign.replies?.resident && run.campaign.letters.s03?.status !== 'carried');
}
export function stairLetterIds(run: Run): string[] {
  const { stair, letters } = run.campaign;
  if (!stair?.passage) return [];
  return [
    ...(!run.campaign.replies?.resident && !stair.request && !stair.volunteered ? ['s03'] : []),
    ...(stair.request === 'diagram' ? ['s04'] : stair.request === 'meeting' ? ['s05'] : []),
    ...(letters.s04?.status === 'delivered' ? ['s06'] : []),
    ...(letters.s05?.status === 'delivered' ? ['s07'] : []),
    ...(stair.disclosed ? ['s08'] : []),
  ];
}
export function stairActionAvailable(run: Run, type: StairAction['type']): boolean {
  const { campaign } = run, state = campaign.stair, place = currentNode(run);
  if (run.stage !== 'campaign' || !place || !campaign.visited.includes(place)) return false;
  switch (type) {
    case 'learn-stair-passage': return place === 'workshop' && !state?.passage && Boolean(campaign.replies?.repairer || run.replies.includes('workshop:listen'));
    case 'learn-stair-link': return place === 'stair-houses' && Boolean(state?.passage && !state.link && campaign.replies?.resident);
    case 'choose-stair-request': return place === 'stair-houses' && stairConversationReady(run) && !state?.request && !state?.volunteered;
    case 'volunteer-stair-work': return place === 'workshop' && stairConversationReady(run) && !state?.request && !state?.volunteered;
    case 'disclose-stair-claim': return place === 'stair-houses' && Boolean(state?.volunteered && !state.disclosed);
    case 'resolve-stair-response': return place === 'stair-houses' && !state?.response && [campaign.letters.s06, campaign.letters.s07].some(letter => letter?.status === 'delivered');
  }
}
export function reduceStairs(run: Run, action: StairAction): Partial<Run> {
  if (!stairActionAvailable(run, action.type)) throw new Error('Side conversation unavailable');
  const campaign = { ...run.campaign, lastOutcome: undefined }, state = campaign.stair ?? {};
  const trust = (person: string, amount: number) => ({ ...campaign.trust, [person]: Math.max(-10, Math.min(10, (campaign.trust[person] ?? 0) + amount)) });
  switch (action.type) {
    case 'learn-stair-passage': return { navigation: revealStairPassage(run), campaign: { ...campaign, stair: { ...state, passage: true } } };
    case 'learn-stair-link': return { navigation: revealStairLink(run), campaign: { ...campaign, stair: { ...state, link: true } } };
    case 'choose-stair-request':
      if (!['diagram', 'meeting', 'declined'].includes(action.reply)) throw new Error('Invalid request choice');
      return { campaign: { ...campaign, stair: { ...state, request: action.reply } } };
    case 'volunteer-stair-work': return { campaign: { ...campaign, stair: { ...state, volunteered: true }, trust: trust('repairer', -1) } };
    case 'disclose-stair-claim': return { campaign: { ...campaign, stair: { ...state, disclosed: true }, trust: trust('resident', -2) } };
    case 'resolve-stair-response':
      if (!['accepted', 'declined'].includes(action.reply)) throw new Error('Invalid response');
      return { campaign: { ...campaign, stair: { ...state, response: action.reply } } };
  }
}
export function isStairAction(action: { type: string }): action is StairAction {
  return ['learn-stair-passage', 'learn-stair-link', 'choose-stair-request', 'volunteer-stair-work', 'disclose-stair-claim', 'resolve-stair-response'].includes(action.type);
}
