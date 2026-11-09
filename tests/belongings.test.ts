import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, createRun, isAction } from '../src/domain/prologue.ts';
import type { Run } from '../src/domain/prologue.ts';
import { availableLetters, campaignComplete, resolvedLetters, letterRules } from '../src/domain/campaign.ts';
import { routeBetween } from '../src/domain/campaign-reducer.ts';
import { currentNode, worldGraph, positionOn, remainingQuestSteps } from '../src/domain/navigation.ts';
import type { Place } from '../src/domain/navigation.ts';
import { belongingsActionAvailable, belongingsSceneHere } from '../src/domain/belongings.ts';
import { encounterMarkers } from '../src/domain/encounters.ts';
import { decodeSave, encodeSave } from '../src/adapters/save.ts';

function travel(run: Run, target: Place): Run {
  const opposite = { north: 'south', south: 'north', east: 'west', west: 'east' } as const;
  for (const id of routeBetween(run, currentNode(run)!, target)) {
    const road = worldGraph(run).edges.find(edge => edge.id === id)!, from = currentNode(run)!;
    const to = road.from === from ? road.to : road.from;
    if (!run.navigation!.authorized.includes(id)) run = apply(run, { type: 'chart-route', place: to });
    run = apply(run, { type: 'choose-direction', direction: from === road.from ? road.direction : opposite[road.direction] });
    if (currentNode(run) !== to) run = apply(run, { type: 'steps', amount: road.length });
    assert.equal(currentNode(run), to);
    run = apply(run, { type: 'visit-campaign-place' });
  }
  if (!run.campaign.visited.includes(target)) run = apply(run, { type: 'visit-campaign-place' });
  return run;
}
function courtyard(goal = 100, employed = true): Run {
  let run = createRun(goal);
  run = apply(run, { type: 'enable-navigation' });
  run = apply(run, { type: 'steps', amount: Math.max(1, Math.ceil(goal * .02)) });
  run = apply(run, { type: 'cross' });
  if (employed) {
    run = apply(run, { type: 'accept' });
    run = apply(run, { type: 'steps', amount: Math.max(1, Math.ceil(goal * .1)) });
    run = apply(run, { type: 'arrive' });
    run = apply(run, { type: 'deliver' });
    run = apply(run, { type: 'settle' });
  } else run = apply(run, { type: 'rest' });
  run = apply(run, { type: 'enter-campaign' });
  return travel(run, 'courtyard');
}
function listDelivered(goal = 100, employed = true): Run {
  let run = apply(courtyard(goal, employed), { type: 'learn-belongings-passage' });
  run = travel(run, 'landing');
  run = apply(run, { type: 'dialogue', character: 'owner', reply: 'listen' });
  run = apply(run, { type: 'take-letter', id: 's09' });
  assert.equal(run.campaign.focus?.id, 's09');
  assert((remainingQuestSteps(run) ?? 0) > 0);
  run = travel(run, 'courtyard');
  return apply(run, { type: 'deliver-item', id: 's09' });
}
function clarify(run: Run): Run {
  run = apply(run, { type: 'choose-belongings-answer', reply: 'clarify' });
  run = apply(run, { type: 'take-letter', id: 's10' });
  run = travel(run, 'landing');
  run = apply(run, { type: 'deliver-item', id: 's10' });
  run = apply(run, { type: 'take-letter', id: 's11' });
  run = travel(run, 'courtyard');
  return apply(run, { type: 'deliver-item', id: 's11' });
}

test('an independent introduction reveals only a paid route and preserves the old graph/save until requested', () => {
  const run = courtyard(), point = positionOn(run, run.navigation!);
  assert(!worldGraph(run).edges.some(edge => edge.id === 'landing-lane'));
  assert(!availableLetters(run, 'landing').some(rule => rule.id === 's09'));
  const old = JSON.parse(encodeSave(run)); old.content = 'prologue-10';
  assert.deepEqual(decodeSave(JSON.stringify(old)), run);
  const next = apply(run, { type: 'learn-belongings-passage' });
  assert.equal(next.campaign.belongings?.introducedBy, 'recipient');
  assert.deepEqual(positionOn(next, next.navigation!), point);
  assert.equal(next.reserve, run.reserve);
  assert.equal(next.navigation?.odometer, run.navigation?.odometer);
  assert(routeBetween(next, 'courtyard', 'landing', true).length > 0);
  assert.equal(next.campaign.stair?.passage, true);
  assert.equal(next.campaign.stair?.request, undefined);
  assert(!next.events.some(event => event.type === 'learn-stair-passage'));
  assert.throws(() => apply(next, { type: 'learn-belongings-passage' }));
  assert.deepEqual(decodeSave(encodeSave(next)), next);
});

test('the resident introduction is optional and does not overwrite a previous loop or its carried request', () => {
  let run = travel(courtyard(), 'workshop');
  run = apply(run, { type: 'dialogue', character: 'repairer', reply: 'listen' });
  run = apply(run, { type: 'learn-stair-passage' });
  run = travel(run, 'stair-houses');
  assert(!belongingsActionAvailable(run, 'learn-belongings-passage'));
  run = apply(run, { type: 'dialogue', character: 'resident', reply: 'listen' });
  run = apply(run, { type: 'choose-stair-request', reply: 'diagram' });
  run = apply(run, { type: 'take-letter', id: 's04' });
  const state = run.campaign.stair, focus = run.campaign.focus, letters = run.campaign.letters;
  run = apply(run, { type: 'learn-belongings-passage' });
  assert.equal(run.campaign.belongings?.introducedBy, 'resident');
  assert.deepEqual(run.campaign.stair, state);
  assert.deepEqual(run.campaign.letters, letters);
  assert.deepEqual(run.campaign.focus, focus);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('clarification is a separate request and answer, with no object or delivery manufactured by choosing it', () => {
  let run = listDelivered();
  const xp = run.campaign.xp, deliveries = run.delivered;
  run = apply(run, { type: 'choose-belongings-answer', reply: 'clarify' });
  assert.equal(run.campaign.letters.s10, undefined);
  assert.equal(run.campaign.xp, xp);
  assert.equal(run.delivered, deliveries);
  assert(availableLetters(run, 'courtyard').some(rule => rule.id === 's10'));
  run = apply(run, { type: 'take-letter', id: 's10' });
  assert.throws(() => apply(run, { type: 'deliver-item', id: 's10' }));
  assert(!availableLetters(run, 'landing').some(rule => rule.id === 's11'));
  run = travel(run, 'landing');
  run = apply(run, { type: 'deliver-item', id: 's10' });
  assert(availableLetters(run, 'landing').some(rule => rule.id === 's11'));
  assert(!belongingsActionAvailable(run, 'witness-belongings-collection'));
  const delivered = run.delivered;
  run = apply(run, { type: 'decline-letter', id: 's11' });
  assert.equal(run.delivered, delivered);
  assert(belongingsActionAvailable(run, 'witness-belongings-collection'));
  run = apply(run, { type: 'witness-belongings-collection' });
  assert.equal(run.campaign.belongings?.outcome, 'unanswered');
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('an explicit refusal to decide protects ownership without requiring the longer clarification journey', () => {
  let run = listDelivered(), before = run.campaign.xp!;
  run = apply(run, { type: 'choose-belongings-answer', reply: 'abstain' });
  assert.equal(run.campaign.xp, before);
  assert(!availableLetters(run, 'courtyard').some(rule => rule.id === 's10'));
  assert.throws(() => apply(run, { type: 'witness-belongings-collection' }));
  run = travel(run, 'landing');
  before = run.campaign.xp!;
  run = apply(run, { type: 'witness-belongings-collection' });
  assert.equal(run.campaign.belongings?.outcome, 'left-open');
  assert.equal(run.campaign.xp, before + 20);
  assert(!run.campaign.letters.s10 && !run.campaign.letters.s11);
  const award = run.campaign.xp;
  run = apply(run, { type: 'resolve-belongings-return', reply: 'acknowledge' });
  assert.equal(run.campaign.xp, award);
  assert.throws(() => apply(run, { type: 'witness-belongings-collection' }));
  assert.throws(() => apply(run, { type: 'resolve-belongings-return', reply: 'acknowledge' }));
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('guessing changes no remote trust until witnessed; practical acknowledgement is bounded and gives no XP', () => {
  let run = listDelivered();
  const owner = run.campaign.trust.owner, recipient = run.campaign.trust.recipient;
  run = apply(run, { type: 'choose-belongings-answer', reply: 'guess' });
  assert.equal(run.campaign.trust.owner, owner);
  assert.equal(run.campaign.trust.recipient, recipient);
  run = travel(run, 'landing');
  const xp = run.campaign.xp;
  run = apply(run, { type: 'witness-belongings-collection' });
  assert.equal(run.campaign.belongings?.outcome, 'unauthorized');
  assert.equal(run.campaign.trust.owner, owner - 2);
  assert.equal(run.campaign.trust.recipient, recipient - 1);
  assert.equal(run.campaign.xp, xp);
  run = apply(run, { type: 'resolve-belongings-return', reply: 'acknowledge' });
  assert.equal(run.campaign.trust.owner, owner - 1);
  assert.equal(run.campaign.xp, xp);
  assert(!run.campaign.friends.includes('owner'));
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('clarified collection requires the return visit after the answer, not a click at its destination', () => {
  let run = clarify(listDelivered());
  assert.throws(() => apply(run, { type: 'witness-belongings-collection' }));
  assert.equal(run.campaign.belongings?.outcome, undefined);
  run = travel(run, 'landing');
  run = apply(run, { type: 'witness-belongings-collection' });
  assert.equal(run.campaign.belongings?.outcome, 'clarified');
  assert(belongingsSceneHere(run));
  assert(encounterMarkers(run).some(marker => marker.character === 'recipient' && marker.place === 'landing' && marker.latest));
  run = travel(run, 'courtyard');
  assert(!belongingsSceneHere(run));
  assert(encounterMarkers(run).some(marker => marker.character === 'recipient' && marker.place === 'landing' && !marker.latest));
  run = travel(run, 'landing');
  assert(!belongingsSceneHere(run));
  const xp = run.campaign.xp;
  run = apply(run, { type: 'resolve-belongings-return', reply: 'leave' });
  assert.equal(run.campaign.xp, xp);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('unfinished carried clarification and answer letters cannot be bypassed by the collection scene', () => {
  let run = apply(listDelivered(), { type: 'choose-belongings-answer', reply: 'clarify' });
  run = apply(run, { type: 'take-letter', id: 's10' });
  run = travel(run, 'landing');
  assert.throws(() => apply(run, { type: 'witness-belongings-collection' }));
  run = apply(run, { type: 'deliver-item', id: 's10' });
  run = apply(run, { type: 'take-letter', id: 's11' });
  assert.throws(() => apply(run, { type: 'witness-belongings-collection' }));
  run = apply(run, { type: 'return-item', id: 's11' });
  run = apply(run, { type: 'witness-belongings-collection' });
  assert.equal(run.campaign.belongings?.outcome, 'unanswered');
});

test('sealed bodies, witnessed opening, private destruction and cancellation retain their separate effects', () => {
  for (const outcome of ['open-item', 'destroy-item', 'return-item'] as const) {
    let run = apply(courtyard(), { type: 'learn-belongings-passage' });
    run = travel(run, 'landing');
    run = apply(run, { type: 'take-letter', id: 's09' });
    if (outcome !== 'return-item') run = travel(run, 'stair-houses');
    const trust = run.campaign.trust.owner;
    run = apply(run, { type: outcome, id: 's09' });
    if (outcome !== 'return-item') assert.equal(run.campaign.trust.owner, trust);
    run = travel(run, 'courtyard');
    if (outcome === 'open-item') {
      const recipient = run.campaign.trust.recipient;
      run = apply(run, { type: 'deliver-item', id: 's09' });
      assert.equal(run.campaign.trust.recipient, (recipient ?? 0) - 2);
      assert(run.campaign.letters.s09.opened);
    } else {
      assert.throws(() => apply(run, { type: 'deliver-item', id: 's09' }));
      assert(!belongingsActionAvailable(run, 'choose-belongings-answer'));
    }
    assert.deepEqual(decodeSave(encodeSave(run)), run);
  }
});

test('employment refusal, low trust, small goals and completed old rounds cannot gate the new personal route', () => {
  for (const goal of [1, 2, 3, 100]) {
    let run = listDelivered(goal, false);
    run = apply(run, { type: 'choose-belongings-answer', reply: 'abstain' });
    run = travel(run, 'landing');
    run = apply(run, { type: 'witness-belongings-collection' });
    assert.equal(run.sous, 0);
    assert.equal(resolvedLetters(run), 0);
    assert(!run.events.some(event => event.type === 'accept'));
    assert(worldGraph(run).edges.every(edge => edge.length > 0));
    assert.deepEqual(decodeSave(encodeSave(run)), run);
  }
  let lowTrust = apply(courtyard(), { type: 'learn-belongings-passage' });
  lowTrust = travel(lowTrust, 'landing');
  lowTrust = apply(lowTrust, { type: 'dialogue', character: 'owner', reply: 'press' });
  lowTrust = apply(lowTrust, { type: 'take-letter', id: 's09' });
  lowTrust = apply(lowTrust, { type: 'open-item', id: 's09' });
  assert(lowTrust.campaign.trust.owner < 0);
  lowTrust = travel(lowTrust, 'courtyard');
  lowTrust = apply(lowTrust, { type: 'deliver-item', id: 's09' });
  lowTrust = apply(lowTrust, { type: 'choose-belongings-answer', reply: 'abstain' });
  lowTrust = travel(lowTrust, 'landing');
  lowTrust = apply(lowTrust, { type: 'witness-belongings-collection' });
  assert.equal(lowTrust.campaign.belongings?.outcome, 'left-open');
  assert(lowTrust.campaign.trust.owner < 0);
  assert.deepEqual(decodeSave(encodeSave(lowTrust)), lowTrust);
  let completed = courtyard();
  for (const rule of [...letterRules].sort((a, b) => a.unlock - b.unlock)) {
    completed = travel(completed, rule.from);
    completed = apply(completed, { type: 'decline-letter', id: rule.id });
  }
  assert(campaignComplete(completed));
  completed = travel(completed, 'courtyard');
  completed = apply(completed, { type: 'learn-belongings-passage' });
  assert(campaignComplete(completed));
  assert.equal(resolvedLetters(completed), 20);
});

test('new false reports remain delayed and sender-local after paid travel', () => {
  let run = apply(listDelivered(), { type: 'choose-belongings-answer', reply: 'clarify' });
  run = apply(run, { type: 'take-letter', id: 's10' });
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'destroy-item', id: 's10' });
  run = travel(run, 'courtyard');
  run = apply(run, { type: 'report-item', id: 's10', honest: false });
  const trust = run.campaign.trust.recipient;
  run = apply(run, { type: 'visit-campaign-place' });
  assert.equal(run.campaign.trust.recipient, trust);
  run = travel(run, 'landing');
  assert.equal(run.campaign.trust.recipient, trust);
  run = travel(run, 'courtyard');
  assert.equal(run.campaign.trust.recipient, trust - 3);
  assert(run.campaign.delayed.at(-1)?.settled);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('all new conversation actions reject premature/remote/repeated and malformed requests', () => {
  const run = courtyard();
  assert(!isAction({ type: 'choose-belongings-answer', reply: 'unknown' }));
  assert(!isAction({ type: 'resolve-belongings-return', reply: 'unknown' }));
  for (const action of [{ type: 'witness-belongings-collection' }, { type: 'choose-belongings-answer', reply: 'guess' }, { type: 'resolve-belongings-return', reply: 'acknowledge' }] as const) assert.throws(() => apply(run, action));
  let next = apply(listDelivered(), { type: 'choose-belongings-answer', reply: 'guess' });
  assert.throws(() => apply(next, { type: 'choose-belongings-answer', reply: 'abstain' }));
  next = travel(next, 'landing');
  next = apply(next, { type: 'witness-belongings-collection' });
  assert.throws(() => apply(next, { type: 'witness-belongings-collection' }));
});
