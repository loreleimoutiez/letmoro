import type { Run } from './prologue.ts';
import { currentNode, revealStairPassage } from './navigation.ts';

export interface BelongingsState {
  readonly introducedBy: 'recipient' | 'resident';
  readonly answer?: 'clarify' | 'abstain' | 'guess';
  readonly decidedAt?: number;
  readonly outcome?: 'clarified' | 'left-open' | 'unauthorized' | 'unanswered';
  readonly collectionOdometer?: number;
  readonly response?: 'acknowledge' | 'leave';
}
export type BelongingsAction = { type: 'learn-belongings-passage' | 'witness-belongings-collection' }
  | { type: 'choose-belongings-answer'; reply: 'clarify' | 'abstain' | 'guess' }
  | { type: 'resolve-belongings-return'; reply: 'acknowledge' | 'leave' };

export function belongingsLetterIds(run: Run): string[] {
  const state = run.campaign.belongings, letters = run.campaign.letters;
  if (!state) return [];
  return [
    's09',
    ...(state.answer === 'clarify' && !state.outcome ? ['s10'] : []),
    ...(letters.s10?.status === 'delivered' && !state.outcome ? ['s11'] : []),
  ];
}
export function belongingsActionAvailable(run: Run, type: BelongingsAction['type']): boolean {
  const { campaign } = run, state = campaign.belongings, place = currentNode(run);
  if (run.stage !== 'campaign' || !place || !campaign.visited.includes(place)) return false;
  switch (type) {
    case 'learn-belongings-passage': return !state && (place === 'courtyard' || place === 'stair-houses' && Boolean(campaign.replies?.resident));
    case 'choose-belongings-answer': return place === 'courtyard' && Boolean(state && !state.answer && campaign.letters.s09?.status === 'delivered');
    case 'witness-belongings-collection': {
      if (place !== 'landing' || !state?.answer || state.outcome || (campaign.returnedAt?.landing ?? -1) <= (state.decidedAt ?? Infinity)) return false;
      const { s10, s11 } = campaign.letters;
      if (s10?.status === 'carried' || s11?.status === 'carried') return false;
      return state.answer !== 'clarify' || Boolean(s10 && (s10.status !== 'delivered' || s11));
    }
    case 'resolve-belongings-return': return place === 'landing' && Boolean(state?.outcome && !state.response);
  }
}
export function belongingsSceneHere(run: Run): boolean {
  return currentNode(run) === 'landing' && Boolean(run.campaign.belongings?.outcome) && run.campaign.belongings?.collectionOdometer === run.navigation?.odometer;
}
export function reduceBelongings(run: Run, action: BelongingsAction): Partial<Run> {
  if (!belongingsActionAvailable(run, action.type)) throw new Error('Personal request conversation unavailable');
  const campaign = { ...run.campaign, lastOutcome: undefined }, state = campaign.belongings;
  const trust = (changes: Record<string, number>) => {
    const next = { ...campaign.trust };
    for (const [person, delta] of Object.entries(changes)) next[person] = Math.max(-10, Math.min(10, (next[person] ?? 0) + delta));
    return next;
  };
  switch (action.type) {
    case 'learn-belongings-passage': {
      // An independent introduction can reveal the same road without accepting its other quest.
      const nav = campaign.stair?.passage ? run.navigation! : revealStairPassage(run);
      return { navigation: { ...nav, authorized: [...new Set([...nav.authorized, 'workshop' as const, 'landing-lane' as const])] }, campaign: {
        ...campaign, stair: { ...campaign.stair, passage: true }, belongings: { introducedBy: currentNode(run) === 'courtyard' ? 'recipient' : 'resident' },
      } };
    }
    case 'choose-belongings-answer':
      if (!['clarify', 'abstain', 'guess'].includes(action.reply)) throw new Error('Invalid personal answer');
      return { campaign: { ...campaign, belongings: { ...state!, answer: action.reply, decidedAt: run.events.length } } };
    case 'witness-belongings-collection': {
      const outcome = state!.answer === 'guess' ? 'unauthorized' : state!.answer === 'abstain' ? 'left-open' : campaign.letters.s11?.status === 'delivered' ? 'clarified' : 'unanswered';
      return { campaign: { ...campaign,
        belongings: { ...state!, outcome, collectionOdometer: run.navigation!.odometer },
        trust: trust(outcome === 'unauthorized' ? { owner: -2, recipient: -1 } : { owner: 1 }),
        encounters: [...(campaign.encounters ?? []), { character: 'recipient', place: 'landing', event: run.events.length }],
      } };
    }
    case 'resolve-belongings-return':
      if (!['acknowledge', 'leave'].includes(action.reply)) throw new Error('Invalid return response');
      return { campaign: { ...campaign, belongings: { ...state!, response: action.reply },
        ...(state!.outcome === 'unauthorized' && action.reply === 'acknowledge' ? { trust: trust({ owner: 1 }) } : {}),
      } };
  }
}
export function isBelongingsAction(action: { type: string }): action is BelongingsAction {
  return ['learn-belongings-passage', 'choose-belongings-answer', 'witness-belongings-collection', 'resolve-belongings-return'].includes(action.type);
}
