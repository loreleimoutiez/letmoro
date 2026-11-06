import { advanceNavigation, atPlace, authorizeRoute, enableNavigation, questReady, selectDirection } from './navigation.ts';
import type { Direction, Navigation, Neighborhood } from './navigation.ts';
import { beginLifeCalendar, initialLives, recordLifeDay } from './lives.ts';
import type { LifeState, LifeDay } from './lives.ts';
import { healthChanges } from './health.ts';
import { parseProfile } from './profile.ts';
import type { Profile } from './profile.ts';
export const CONTENT_VERSION = 'prologue-3';
export const stages = ['street', 'job', 'delivery', 'handover', 'settlement', 'complete', 'rest', 'failed', 'neighborhood', 'square', 'workshop', 'errand', 'errand-return'] as const;
export type Stage = typeof stages[number];
type ActionData =
  | { type: 'start-journey' }
  | { type: 'begin-life-accounting'; startedAt: string; zone: string }
  | { type: 'life-day'; day: LifeDay }
  | { type: 'choose-direction'; direction: Direction }
  | { type: 'choose-place' | 'meet-place'; place: Neighborhood }
  | { type: 'reply'; reply: 'listen' | 'help' }
  | { type: 'extend-return-path' | 'resume-help' | 'enable-navigation' | 'continue-neighborhood' | 'explore-neighborhood' | 'finish-conversation' | 'return-to-offer' | 'inspect' | 'finish-errand' }
  | { type: 'test-coins'; amount: number }
  | { type: 'ask'; topic: 'work' | 'pay' | 'directions' }
  | { type: 'health-sync'; dayKey: string; total: number }
  | { type: 'steps'; amount: number; source?: 'health' }
  | { type: 'cross' | 'accept' | 'rest' | 'arrive' | 'deliver' | 'settle' | 'reconsider' | 'open-letter' | 'destroy-letter' | 'report-loss' };
export type Action = ActionData & { readonly at?: string };
export interface Run {
  readonly life: LifeState;
  readonly navigation?: Navigation;
  readonly destination?: Neighborhood;
  readonly replies: readonly string[];
  readonly errand?: { from: Neighborhood; inspected?: boolean };
  readonly completedErrands: readonly Neighborhood[];
  readonly letterOpened: boolean;
  readonly letterDestroyed: boolean;
  readonly discussed: readonly ('work' | 'pay' | 'directions')[];
  readonly goal: number;
  readonly journeyOrigin?: number;
  readonly profile?: Profile;
  readonly stage: Stage;
  readonly reserve: number;
  readonly simulatedSteps: number;
  readonly walkedSteps: number;
  readonly healthLedger: Readonly<Record<string, number>>;
  readonly healthKey?: string;
  readonly sous: number;
  readonly delivered: number;
  readonly events: readonly Action[];
}
export function createRun(goal: number, profile?: Profile): Run {
  if (!Number.isSafeInteger(goal) || goal < 1 || goal > 100000) throw new Error('Invalid daily goal');
  return { ...(profile ? { profile: parseProfile(profile) } : {}), goal, life: initialLives(), replies: [], completedErrands: [], letterOpened: false, letterDestroyed: false, discussed: [], stage: 'street', reserve: 0, simulatedSteps: 0, walkedSteps: 0, healthLedger: {}, sous: 0, delivered: 0, events: [] };
}
// Trial ratios only; production travel balance and goal changes are undecided.
export function travelCost(run: Run): number {
  return Math.max(1, Math.ceil(run.goal * (run.stage === 'street' ? 0.02 : 0.1)));
}
export function apply(run: Run, action: Action): Run {
  if (run.life.lives === 0 && !['health-sync', 'life-day', 'begin-life-accounting'].includes(action.type)) throw new Error('Run has ended');
  let changes: Partial<Run>;
  switch (action.type) {
    case 'begin-life-accounting':
      if (run.life.calendar) throw new Error('Life accounting already initialized');
      changes = { life: beginLifeCalendar(action.startedAt, action.zone) };
      break;
    case 'life-day': {
      const life = recordLifeDay(run.life, action.day, run.goal, run.profile?.mode ?? 'free');
      if (life === run.life) return run;
      changes = { life };
      break;
    }
    case 'extend-return-path':
      if (!run.navigation || run.navigation.openRetreat) throw new Error('Return path already extended');
      changes = { navigation: { ...run.navigation, openRetreat: true, authorized: [...run.navigation.authorized, 'outskirts'] } };
      break;
    case 'resume-help':
      if (!run.errand || ['street', 'job', 'delivery', 'handover', 'settlement', 'errand', 'errand-return'].includes(run.stage)) throw new Error('Help cannot resume now');
      changes = { stage: run.errand.inspected ? 'errand-return' : 'errand' };
      break;
    case 'enable-navigation':
      if (run.navigation) throw new Error('Navigation already enabled');
      changes = enableNavigation(run);
      break;
    case 'choose-direction':
      changes = { navigation: selectDirection(run, action.direction) };
      break;
    case 'continue-neighborhood':
    case 'explore-neighborhood':
      if (!run.navigation || (action.type === 'continue-neighborhood' ? !['complete', 'failed'].includes(run.stage) || !atPlace(run, 'courtyard') : run.stage !== 'rest' || !atPlace(run, 'office'))) throw new Error('Exploration unavailable');
      changes = { stage: 'neighborhood', navigation: authorizeRoute(run, 'courtyard'), destination: undefined };
      break;
    case 'choose-place': {
      if (run.stage !== 'neighborhood' || !['square', 'workshop'].includes(action.place)) throw new Error('Route choice unavailable');
      const navigation = authorizeRoute(run, action.place);
      const directed = { ...run, navigation };
      changes = { destination: action.place, navigation: atPlace(run, 'courtyard') ? selectDirection(directed, action.place === 'square' ? 'west' : 'east') : atPlace(run, 'office') ? selectDirection(directed, 'north') : navigation };
      break;
    }
    case 'meet-place':
      if (run.stage !== 'neighborhood' || run.destination !== action.place || !atPlace(run, action.place)) throw new Error('Encounter unavailable');
      changes = { stage: action.place, destination: undefined };
      break;
    case 'reply': {
      if (!['square', 'workshop'].includes(run.stage) || !atPlace(run, run.stage as Neighborhood) || !['listen', 'help'].includes(action.reply)) throw new Error('Reply unavailable');
      const place = run.stage as Neighborhood, key = `${place}:${action.reply}`;
      if (run.replies.includes(key) || (action.reply === 'help' && (run.errand || run.completedErrands.includes(place)))) throw new Error('Reply already used');
      changes = { replies: [...run.replies, key], ...(action.reply === 'help' ? { stage: 'errand' as const, errand: { from: place }, navigation: selectDirection({ ...run, navigation: authorizeRoute(run, place === 'square' ? 'garden' : 'gate') }, 'north') } : {}) };
      break;
    }
    case 'inspect':
      if (run.stage !== 'errand' || !questReady(run)) throw new Error('Inspection unavailable');
      changes = { stage: 'errand-return', errand: { ...run.errand!, inspected: true } };
      break;
    case 'finish-errand':
      if (run.stage !== 'errand-return' || !run.errand || !questReady(run)) throw new Error('Return unavailable');
      changes = { stage: run.errand.from, completedErrands: [...run.completedErrands, run.errand.from], errand: undefined };
      break;
    case 'finish-conversation':
      if (!['square', 'workshop'].includes(run.stage) || !atPlace(run, run.stage as Neighborhood)) throw new Error('Conversation unavailable');
      changes = { stage: 'neighborhood', destination: undefined };
      break;
    case 'return-to-offer':
      if (run.stage !== 'neighborhood' || !atPlace(run, 'office') || run.events.some(event => event.type === 'accept')) throw new Error('Offer unavailable');
      changes = { stage: 'job', destination: undefined };
      break;
    case 'test-coins':
      if (!Number.isSafeInteger(action.amount) || action.amount < 0 || action.amount > 1000000000) throw new Error('Invalid test balance');
      changes = { sous: action.amount };
      break;
    case 'start-journey':
      if (run.journeyOrigin !== undefined || !run.healthKey) throw new Error('Journey baseline unavailable');
      changes = { journeyOrigin: Math.max(0, run.walkedSteps - run.reserve) };
      break;
    case 'health-sync':
      changes = healthChanges(run, action.dayKey, action.total);
      if (run.life.lives === 0) changes = { ...changes, reserve: run.reserve };
      break;
    case 'steps':
      if (!Number.isSafeInteger(action.amount) || action.amount < 1 || (action.source !== 'health' && action.amount > 100000) ||
          (action.source === 'health' ? run.walkedSteps : run.simulatedSteps) + action.amount > Number.MAX_SAFE_INTEGER) throw new Error('Invalid simulated steps');
      changes = { ...(action.source === 'health' ? { walkedSteps: run.walkedSteps + action.amount } : { simulatedSteps: run.simulatedSteps + action.amount }), reserve: Math.min(run.goal * 7, run.reserve + action.amount) };
      break;
    case 'cross':
    case 'arrive': {
      const expected = action.type === 'cross' ? 'street' : 'delivery';
      if (run.stage !== expected || (run.navigation ? !questReady(run) : run.reserve < travelCost(run))) throw new Error('Journey unavailable');
      changes = { stage: action.type === 'cross' ? 'job' : 'handover', reserve: run.navigation ? run.reserve : run.reserve - travelCost(run) };
      break;
    }
    case 'ask':
      if (run.stage !== 'job' || !atPlace(run, 'office') || !['work', 'pay', 'directions'].includes(action.topic) || run.discussed.includes(action.topic)) throw new Error('Dialogue unavailable');
      changes = { discussed: [...run.discussed, action.topic] };
      break;
    case 'reconsider':
      if (run.stage !== 'rest' || !atPlace(run, 'office')) throw new Error('No offer to reconsider');
      changes = { stage: 'job' };
      break;
    case 'open-letter':
    case 'destroy-letter':
      if (!['delivery', 'handover'].includes(run.stage) || run.letterDestroyed || (action.type === 'open-letter' && run.letterOpened)) throw new Error('Letter unavailable');
      changes = action.type === 'open-letter' ? { letterOpened: true } : { letterDestroyed: true };
      break;
    case 'report-loss':
      if (run.stage !== 'handover' || !atPlace(run, 'courtyard') || !run.letterDestroyed) throw new Error('No missing letter to report');
      changes = { stage: 'failed' };
      break;
    case 'accept':
    case 'rest':
      if (run.stage !== 'job' || !atPlace(run, 'office')) throw new Error('No job decision pending');
      changes = { stage: action.type === 'accept' ? 'delivery' : 'rest', ...(action.type === 'accept' && run.navigation ? { navigation: selectDirection({ ...run, navigation: authorizeRoute(run, 'courtyard') }, 'north') } : {}) };
      break;
    case 'deliver':
      if (run.stage !== 'handover' || !atPlace(run, 'courtyard') || run.letterDestroyed) throw new Error('No letter to deliver');
      changes = { stage: 'settlement', delivered: 1 };
      break;
    case 'settle':
      if (run.stage !== 'settlement' || !atPlace(run, 'courtyard')) throw new Error('No wages pending');
      changes = { stage: 'complete', sous: run.sous + 8 - 2 - 2 };
      break;
    default: throw new Error('Unknown action');
  }
  const next = { ...run, ...changes, events: [...run.events, action] };
  return next.life.lives > 0 && ['steps', 'health-sync', 'choose-direction', 'choose-place', 'accept', 'reply'].includes(action.type) ? advanceNavigation(next) : next;
}
export function isAction(value: unknown): value is Action {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  if (item.at !== undefined && (typeof item.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(item.at) || !Number.isFinite(Date.parse(item.at)))) return false;
  if (item.type === 'begin-life-accounting') return typeof item.startedAt === 'string' && typeof item.zone === 'string';
  if (item.type === 'life-day') return Boolean(item.day && typeof item.day === 'object');
  if (item.type === 'choose-direction') return ['north', 'east', 'south', 'west'].includes(String(item.direction));
  if (item.type === 'choose-place' || item.type === 'meet-place') return ['square', 'workshop'].includes(String(item.place));
  if (item.type === 'reply') return ['listen', 'help'].includes(String(item.reply));
  if (item.type === 'test-coins') return typeof item.amount === 'number';
  if (item.type === 'ask') return ['work', 'pay', 'directions'].includes(String(item.topic));
  if (item.type === 'health-sync') return typeof item.dayKey === 'string' && typeof item.total === 'number';
  return item.type === 'steps' ? typeof item.amount === 'number' && (item.source === undefined || item.source === 'health') :
    ['extend-return-path', 'resume-help', 'enable-navigation', 'continue-neighborhood', 'explore-neighborhood', 'finish-conversation', 'return-to-offer', 'inspect', 'finish-errand', 'start-journey', 'cross', 'accept', 'rest', 'arrive', 'deliver', 'settle', 'reconsider', 'open-letter', 'destroy-letter', 'report-loss'].includes(String(item.type));
}
