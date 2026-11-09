import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apply, createRun, isAction } from '../src/domain/prologue.ts';
import type { Run } from '../src/domain/prologue.ts';
import { availableLetters, campaignComplete, resolvedLetters, letterRules } from '../src/domain/campaign.ts';
import { routeBetween } from '../src/domain/campaign-reducer.ts';
import { worldGraph, currentNode, positionOn, revealStairPassage, revealStairLink, remainingQuestSteps } from '../src/domain/navigation.ts';
import type { Place } from '../src/domain/navigation.ts';
import { stairActionAvailable } from '../src/domain/stairs.ts';
import { encodeSave, decodeSave } from '../src/adapters/save.ts';

function workshop(goal = 100, employed = true): Run {
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
  run = travel(run, 'workshop');
  return apply(run, { type: 'dialogue', character: 'repairer', reply: 'listen' });
}
function travel(run: Run, target: Place): Run {
  const opposite = { north: 'south', south: 'north', east: 'west', west: 'east' } as const;
  for (const id of routeBetween(run, currentNode(run)!, target)) {
    const edge = worldGraph(run).edges.find(road => road.id === id)!, from = currentNode(run)!;
    const to = edge.from === from ? edge.to : edge.from;
    if (!run.navigation!.authorized.includes(id)) run = apply(run, { type: 'chart-route', place: to });
    run = apply(run, { type: 'choose-direction', direction: edge.from === from ? edge.direction : opposite[edge.direction] });
    if (currentNode(run) !== to) run = apply(run, { type: 'steps', amount: edge.length });
    assert.equal(currentNode(run), to);
    run = apply(run, { type: 'visit-campaign-place' });
  }
  if (!run.campaign.visited.includes(target)) run = apply(run, { type: 'visit-campaign-place' });
  return run;
}
function introduction(goal = 100, employed = true): Run {
  let run = apply(workshop(goal, employed), { type: 'learn-stair-passage' });
  run = apply(run, { type: 'take-letter', id: 's03' });
  assert.throws(() => apply(run, { type: 'deliver-item', id: 's03' }));
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'deliver-item', id: 's03' });
  return apply(run, { type: 'dialogue', character: 'resident', reply: 'listen' });
}
function response(kind: 'diagram' | 'meeting'): Run {
  let run = apply(introduction(), { type: 'choose-stair-request', reply: kind });
  const request = kind === 'diagram' ? 's04' : 's05', reply = kind === 'diagram' ? 's06' : 's07';
  assert(!availableLetters(run, 'stair-houses').some(rule => rule.id === (kind === 'diagram' ? 's05' : 's04')));
  run = apply(run, { type: 'take-letter', id: request });
  run = travel(run, 'workshop');
  assert(!availableLetters(run, 'workshop').some(rule => rule.id === reply));
  run = apply(run, { type: 'deliver-item', id: request });
  assert(availableLetters(run, 'workshop').some(rule => rule.id === reply));
  run = apply(run, { type: 'take-letter', id: reply });
  assert((remainingQuestSteps(run) ?? 0) > 0);
  run = travel(run, 'stair-houses');
  return apply(run, { type: 'deliver-item', id: reply });
}

test('secondary introduction is explicit, conversation-gated and replay-safe without changing old saves', () => {
  const run = workshop(), before = positionOn(run, run.navigation!);
  assert(!worldGraph(run).edges.some(edge => edge.id === 'stair-lane'));
  assert(!availableLetters(run, 'workshop').some(rule => rule.id === 's03'));
  const next = apply(run, { type: 'learn-stair-passage' });
  assert.deepEqual(positionOn(next, next.navigation!), before);
  assert.equal(next.reserve, run.reserve);
  assert.equal(next.navigation?.odometer, run.navigation?.odometer);
  assert(availableLetters(next, 'workshop').some(rule => rule.id === 's03'));
  assert.throws(() => apply(next, { type: 'learn-stair-passage' }));
  assert.deepEqual(decodeSave(encodeSave(next)), next);
  const old = JSON.parse(encodeSave(run)); old.content = 'prologue-9';
  assert.deepEqual(decodeSave(JSON.stringify(old)), run);
  assert.equal(decodeSave(JSON.stringify(old)).campaign.stair, undefined);
  const beforeConversation = workshop().events.slice(0, -1).reduce((state, action) => apply(state, action), createRun(100));
  assert.throws(() => apply(beforeConversation, { type: 'learn-stair-passage' }));
});

test('both road splits preserve position, partial walked intervals, direction and paid distance', () => {
  for (const kind of ['passage', 'link'] as const) {
    const initial = workshop();
    const base = kind === 'passage' ? initial : apply(initial, { type: 'learn-stair-passage' });
    const edge = kind === 'passage' ? 'workshop' : 'gate';
    const length = worldGraph(base).edges.find(road => road.id === edge)!.length;
    for (const offset of [0, 1, Math.floor(length / 2), Math.ceil(base.goal * .45), length - 1, length]) for (const heading of [1, -1, null] as const) {
      const run = { ...base, navigation: { ...base.navigation!, edge, offset, heading, authorized: [...base.navigation!.authorized, edge], walked: { ...base.navigation!.walked, [edge]: { min: 1, max: length - 1 } } } };
      const point = positionOn(run, run.navigation), prior = run.navigation.walked;
      const navigation = kind === 'passage' ? revealStairPassage(run) : revealStairLink(run);
      const next = { ...run, navigation, campaign: { ...run.campaign, stair: { ...run.campaign.stair, passage: true, ...(kind === 'link' ? { link: true } : {}) } } };
      assert.deepEqual(positionOn(next, navigation), point);
      const split = kind === 'passage' ? Math.floor(length / 2) : Math.max(1, Math.ceil(run.goal * .45));
      assert.equal(navigation.heading, offset === split ? null : heading);
      assert(navigation.authorized.includes(kind === 'passage' ? 'workshop-east' : 'gate-north'));
      assert.equal(navigation.lastHeading, run.navigation.lastHeading);
      const sum = (walked: typeof navigation.walked) => Object.values(walked).reduce((total, range) => total + range!.max - range!.min, 0);
      assert.equal(sum(navigation.walked), sum(prior));
      assert.equal(navigation.odometer, run.navigation.odometer);
      assert.equal(next.reserve, run.reserve);
    }
  }
});

test('the return connection is learned in person and creates a paid loop with no travel grant', () => {
  let run = introduction();
  assert(!worldGraph(run).edges.some(edge => edge.id === 'stair-link'));
  const before = run.navigation!.odometer!;
  run = apply(run, { type: 'learn-stair-link' });
  assert.equal(run.navigation!.odometer, before);
  assert.throws(() => apply(run, { type: 'learn-stair-link' }));
  const distance = routeBetween(run, 'stair-houses', 'workshop', true).reduce((sum, id) => sum + worldGraph(run).edges.find(edge => edge.id === id)!.length, 0);
  run = travel(run, 'workshop');
  assert.equal(run.navigation!.odometer! - before, distance);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('diagram and meeting requests are exclusive and their delivery leaves the final response explicit', () => {
  for (const kind of ['diagram', 'meeting'] as const) for (const reply of ['accepted', 'declined'] as const) {
    let run = response(kind);
    assert.equal(run.campaign.stair?.response, undefined);
    const xp = run.campaign.xp, count = resolvedLetters(run);
    run = apply(run, { type: 'resolve-stair-response', reply });
    assert.equal(run.campaign.stair?.response, reply);
    assert.equal(run.campaign.xp, xp);
    assert.equal(resolvedLetters(run), count);
    assert(!campaignComplete(run));
    assert.throws(() => apply(run, { type: 'resolve-stair-response', reply }));
    assert.throws(() => apply(run, { type: 'choose-stair-request', reply: kind === 'diagram' ? 'meeting' : 'diagram' }));
    assert.deepEqual(decodeSave(encodeSave(run)), run);
  }
});

test('a visit without an introductory letter permits a personal request and no unpaid job is accepted', () => {
  let run = apply(workshop(100, false), { type: 'learn-stair-passage' });
  run = apply(run, { type: 'decline-letter', id: 's03' });
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'dialogue', character: 'resident', reply: 'listen' });
  run = apply(run, { type: 'choose-stair-request', reply: 'diagram' });
  assert(availableLetters(run, 'stair-houses').some(rule => rule.id === 's04'));
  run = apply(run, { type: 'take-letter', id: 's04' });
  run = travel(run, 'workshop');
  run = apply(run, { type: 'deliver-item', id: 's04' });
  run = apply(run, { type: 'take-letter', id: 's06' });
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'deliver-item', id: 's06' });
  run = apply(run, { type: 'resolve-stair-response', reply: 'accepted' });
  assert(!run.events.some(event => event.type === 'accept'));
  assert.equal(run.sous, 0);
  assert.equal(resolvedLetters(run), 0);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('declining a new promise grants no XP, does not create a letter and preserves old round closure', () => {
  let run = introduction();
  const before = run.campaign.xp;
  run = apply(run, { type: 'choose-stair-request', reply: 'declined' });
  assert.equal(run.campaign.xp, before);
  assert(!availableLetters(run, 'stair-houses').some(rule => ['s04', 's05'].includes(rule.id)));
  assert.throws(() => apply(run, { type: 'choose-stair-request', reply: 'meeting' }));
  const closed = { ...run, campaign: { ...run.campaign, completed: true } };
  assert(campaignComplete(closed));
  assert.equal(resolvedLetters(run), 0);
});

test('a witnessed false promise changes only the witness until disclosure and requires a delivered correction', () => {
  let run = travel(introduction(), 'workshop');
  const resident = run.campaign.trust.resident, repairer = run.campaign.trust.repairer, xp = run.campaign.xp;
  run = apply(run, { type: 'volunteer-stair-work' });
  assert.equal(run.campaign.trust.resident, resident);
  assert.equal(run.campaign.trust.repairer, repairer - 1);
  assert.equal(run.campaign.xp, xp);
  assert.throws(() => apply(run, { type: 'disclose-stair-claim' }));
  assert(!availableLetters(run, 'stair-houses').some(rule => rule.id === 's08'));
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'disclose-stair-claim' });
  assert.equal(run.campaign.trust.resident, resident - 2);
  run = apply(run, { type: 'take-letter', id: 's08' });
  assert.throws(() => apply(run, { type: 'deliver-item', id: 's08' }));
  run = travel(run, 'workshop');
  const before = run.campaign.xp!;
  run = apply(run, { type: 'deliver-item', id: 's08' });
  assert.equal(run.campaign.xp, before + 18);
  assert.equal(run.campaign.letters.s08.reported, false);
  assert.equal(run.campaign.trust.resident, resident - 2);
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'report-item', id: 's08', honest: true });
  assert.equal(run.campaign.trust.resident, resident - 1);
  assert.throws(() => apply(run, { type: 'disclose-stair-claim' }));
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});

test('opening, private destruction and physical return retain separate outcomes on the new letters', () => {
  let run = apply(introduction(), { type: 'choose-stair-request', reply: 'diagram' });
  run = apply(run, { type: 'take-letter', id: 's04' });
  run = travel(run, 'stair-turn');
  const sender = run.campaign.trust.resident, recipient = run.campaign.trust.repairer;
  run = apply(run, { type: 'open-item', id: 's04' });
  assert.equal(run.campaign.trust.resident, sender);
  run = travel(run, 'workshop');
  run = apply(run, { type: 'deliver-item', id: 's04' });
  assert.equal(run.campaign.trust.repairer, recipient - 2);
  assert.throws(() => apply(run, { type: 'open-item', id: 's04' }));
  for (const outcome of ['destroy-item', 'return-item'] as const) {
    let alternative = apply(introduction(), { type: 'choose-stair-request', reply: 'meeting' });
    alternative = apply(alternative, { type: 'take-letter', id: 's05' });
    if (outcome === 'destroy-item') alternative = travel(alternative, 'stair-turn');
    const trust = alternative.campaign.trust.resident;
    alternative = apply(alternative, { type: outcome, id: 's05' });
    if (outcome === 'destroy-item') assert.equal(alternative.campaign.trust.resident, trust);
    assert(!availableLetters(alternative, 'workshop').some(rule => rule.id === 's07'));
    assert.deepEqual(decodeSave(encodeSave(alternative)), alternative);
  }
});

test('tiny daily goals keep the lane and reconnection usable without zero-length roads or direction collisions', () => {
  for (const goal of [1, 2, 3]) {
    let run = introduction(goal);
    run = apply(run, { type: 'learn-stair-link' });
    assert(worldGraph(run).edges.every(edge => edge.length > 0));
    const graph = worldGraph(run);
    for (const place of Object.keys(graph.places)) {
      const headings = graph.edges.filter(edge => edge.from === place || edge.to === place).map(edge => edge.from === place ? edge.direction : ({ north: 'south', south: 'north', east: 'west', west: 'east' } as const)[edge.direction]);
      assert.equal(new Set(headings).size, headings.length, `${goal}: ${place}`);
    }
    run = travel(run, 'workshop');
    assert.equal(currentNode(run), 'workshop');
    assert.deepEqual(decodeSave(encodeSave(run)), run);
  }
});

test('new scene actions reject invalid choices, premature responses and remote activation', () => {
  const run = workshop();
  assert(!isAction({ type: 'choose-stair-request', reply: 'unknown' }));
  assert(!isAction({ type: 'resolve-stair-response', reply: 'unknown' }));
  for (const action of [{ type: 'choose-stair-request', reply: 'diagram' }, { type: 'resolve-stair-response', reply: 'accepted' }, { type: 'learn-stair-link' }, { type: 'volunteer-stair-work' }] as const) assert.throws(() => apply(run, action));
  assert(!stairActionAvailable(introduction(), 'volunteer-stair-work'));
});

test('new false reports wait for later paid travel and a sender encounter even after the old round is finished', () => {
  let run = introduction();
  for (const rule of [...letterRules].sort((a, b) => a.unlock - b.unlock)) {
    run = travel(run, rule.from);
    run = apply(run, { type: 'decline-letter', id: rule.id });
  }
  assert(campaignComplete(run));
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'choose-stair-request', reply: 'diagram' });
  run = apply(run, { type: 'take-letter', id: 's04' });
  run = travel(run, 'stair-turn');
  run = apply(run, { type: 'open-item', id: 's04' });
  run = travel(run, 'workshop');
  run = apply(run, { type: 'deliver-item', id: 's04' });
  run = travel(run, 'stair-houses');
  run = apply(run, { type: 'report-item', id: 's04', honest: false });
  const trust = run.campaign.trust.resident;
  run = apply(run, { type: 'visit-campaign-place' });
  assert.equal(run.campaign.trust.resident, trust);
  assert.equal(run.campaign.delayed.at(-1)?.settled, false);
  run = travel(run, 'workshop');
  assert.equal(run.campaign.trust.resident, trust);
  run = travel(run, 'stair-houses');
  assert.equal(run.campaign.delayed.at(-1)?.settled, true);
  assert.equal(run.campaign.trust.resident, trust - 3);
  const after = run.campaign.trust.resident;
  run = apply(run, { type: 'visit-campaign-place' });
  assert.equal(run.campaign.trust.resident, after);
  assert.equal(resolvedLetters(run), 20);
  assert.deepEqual(decodeSave(encodeSave(run)), run);
});
