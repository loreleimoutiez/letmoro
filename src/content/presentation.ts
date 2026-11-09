import {skillCopy} from './skills.ts';
import type { Action, Run } from '../domain/prologue.ts';
import { atPlace } from '../domain/navigation.ts';
import type { Neighborhood } from '../domain/navigation.ts';
import type { OpeningContent } from './narrative.ts';
import {fr} from './ui.ts';
import type { en } from './ui.ts';

export function sceneCopy(run: Run, fallback: string, t: typeof en, content?: OpeningContent): string {
  const visit = content?.visits?.[(run.errand?.from ?? run.stage) as Neighborhood];
  switch (run.stage) {
    case 'job': return content?.job ?? fallback;
    case 'rest': return content?.rest ?? fallback;
    case 'handover': return run.letterDestroyed ? content?.destroyedHandover ?? t.destroyed : run.letterOpened ? content?.openedHandover ?? t.opened : fallback;
    case 'errand': return visit?.task ?? fallback;
    case 'errand-return': return atPlace(run, run.errand?.from === 'square' ? 'garden' : 'gate') ? visit?.return ?? fallback : fallback;
    case 'square': case 'workshop': return visit?.title ?? fallback;
    default: return content?.scenes?.[run.stage] ?? fallback;
  }
}
export function journalCopy(event: Action, t: typeof en, original: Record<string, string>, content?: OpeningContent): string | undefined {
  switch (event.type) {
    case 'learn-belongings-passage': case 'witness-belongings-collection':
      return content?.campaign?.belongings?.journal[event.type] ?? t.dialogueRecorded;
    case 'choose-belongings-answer': case 'resolve-belongings-return':
      return content?.campaign?.belongings?.journal[`${event.type}:${event.reply}`] ?? t.dialogueRecorded;
    case 'learn-stair-passage': case 'learn-stair-link': case 'volunteer-stair-work': case 'disclose-stair-claim':
      return content?.campaign?.stairPassage?.journal[event.type] ?? t.dialogueRecorded;
    case 'choose-stair-request': case 'resolve-stair-response':
      return content?.campaign?.stairPassage?.journal[`${event.type}:${event.reply}`] ?? t.dialogueRecorded;
    case 'follow-up':return content?.campaign?.revisits?.[event.id]?.[event.reply==='listen'?'listening':'leaving']??t.dialogueRecorded;
    case 'learn-side-passage':return content?.campaign?.sidePassage?.discover??t.routeRecorded;
    case 'resolve-side-reply':return content?.campaign?.sidePassage?.[event.reply==='direct'?'directOutcome':'declineOutcome']??t.dialogueRecorded;
    case 'buy-skill': return `${skillCopy(event.id,t===fr?'fr':'en')[0]} · XP`;
    case 'set-rest-days': return t.lifeHeading;
    case 'take-letter': case 'decline-letter': case 'open-item': case 'destroy-item': case 'deliver-item': case 'return-item': case 'report-item': return `${({ 'take-letter':t.accept, 'decline-letter':t.rest, 'open-item':t.openRecorded, 'destroy-item':t.destroyRecorded, 'deliver-item':t.deliver, 'return-item':t.back, 'report-item':t.shareFindings })[event.type]} · ${content?.campaign?.letters[event.id]?.title ?? event.id}`;
    case 'dialogue': return event.reply==='listen'?t.listenRecorded:t.dialogueRecorded;
    case 'befriend': return t.encounterRecorded;
    case 'enter-campaign': return t.explorationRecorded;
    case 'choose-direction': return `${t.journeyRecorded} ${t.directions[event.direction]}`;
    case 'choose-place': return `${t.routeRecorded} ${t.places[event.place]}`;
    case 'meet-place': return `${t.encounterRecorded} ${t.places[event.place]}`;
    case 'reply': return event.reply === 'help' ? t.helpRecorded : t.listenRecorded;
    case 'life-day': return `${event.day.source === 'test' ? t.lifeTestDate : t.lifeDayRecorded} ${event.day.date}`;
    case 'resume-help': return t.resumeHelp;
    case 'ask': return content?.topics[event.topic].journal ?? t.dialogueRecorded;
    default: return original[event.type] ?? ({ reconsider: t.reconsiderRecorded, 'open-letter': t.openRecorded, 'destroy-letter': t.destroyRecorded, 'report-loss': t.lossRecorded, 'continue-neighborhood': t.explorationRecorded, 'explore-neighborhood': t.explorationRecorded, 'finish-conversation': t.conversationEnded, 'return-to-offer': t.reconsiderRecorded, inspect: t.inspectRecorded, 'finish-errand': t.helpCompleted } as Record<string, string>)[event.type];
  }
}
