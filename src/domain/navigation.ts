import { allLetterRules as letterRules } from './campaign.ts';
import type { Run } from './prologue.ts';

export const directions = ['north', 'east', 'south', 'west'] as const;
export type Direction = typeof directions[number];
export type Place = 'wash-turn' | 'wash-court' | 'start' | 'approach' | 'office' | 'courtyard' | 'square' | 'workshop' | 'garden' | 'gate' | 'outskirts' | 'bridge' | 'relay' | 'cemetery' | 'ridge' | 'reservoir';
export type Neighborhood = 'square' | 'workshop';
export type EdgeId = 'square-west' | 'wash-lane' | 'crosslane' | 'approach' | 'street' | 'courtyard' | 'square' | 'workshop' | 'garden' | 'gate' | 'outskirts' | 'bridge' | 'relay' | 'cemetery' | 'ridge' | 'reservoir';
export interface Point { x: number; y: number }
export interface Edge { id: EdgeId; from: Place; to: Place; length: number; direction: Direction }
export interface Navigation {
  readonly odometer?: number;
  readonly edge: EdgeId;
  readonly offset: number;
  readonly heading: 1 | -1 | null;
  readonly openRetreat?: boolean;
  readonly lastHeading?: 1 | -1;
  readonly authorized: readonly EdgeId[];
  readonly walked: Readonly<Partial<Record<EdgeId, Readonly<{ min: number; max: number }>>>>;
}
const opposite: Record<Direction, Direction> = { north: 'south', south: 'north', east: 'west', west: 'east' };
export function worldGraph(run: Run) {
  const cost = (ratio: number) => Math.max(1, Math.ceil(run.goal * ratio));
  const street = cost(.02), courtyard = cost(.1), square = cost(.35), workshop = cost(.5), long = cost(2);
  const origin = run.journeyOrigin ?? (run.healthKey ? run.walkedSteps : 0);
  const retreat = Math.max(run.goal, (run.navigation?.walked.outskirts?.max ?? 0) + run.goal, run.navigation?.edge === 'outskirts' ? run.navigation.offset + run.goal : 0);
  const split=run.campaign.washPassage && square>=2, half=Math.floor(square/2);
  const places: Record<Place, Point> = {
    'wash-turn':{x:street-(square>=2?half:square),y:-courtyard},
    'wash-court':{x:street-(square>=2?half:square),y:-courtyard+cost(.45)},
    bridge: { x: street+workshop+cost(.5),y:-courtyard-long }, relay:{x:street+workshop+cost(.5),y:-courtyard-long-cost(.5)},
    cemetery:{x:street-square-cost(1),y:-courtyard-long},ridge:{x:street-square-cost(1),y:-courtyard-long-cost(.5)},reservoir:{x:street+workshop+cost(1),y:-courtyard-long-cost(.5)},
    outskirts: { x: -origin - retreat, y: 0 },
    approach: { x: -origin, y: 0 }, start: { x: 0, y: 0 }, office: { x: street, y: 0 },
    courtyard: { x: street, y: -courtyard }, square: { x: street - square, y: -courtyard },
    workshop: { x: street + workshop, y: -courtyard }, garden: { x: street - square, y: -courtyard - long }, gate: { x: street + workshop, y: -courtyard - long },
  };
  const edges: Edge[] = [
    { id: 'street', from: 'start', to: 'office', length: street, direction: 'east' },
    { id: 'courtyard', from: 'office', to: 'courtyard', length: courtyard, direction: 'north' },
    { id: 'square', from: 'courtyard', to: split?'wash-turn':'square', length: split?half:square, direction: 'west' },
    ...(split?[{id:'square-west' as const,from:'wash-turn' as const,to:'square' as const,length:square-half,direction:'west' as const}]:[]),
    ...(run.campaign.washPassage?[{id:'wash-lane' as const,from:split?'wash-turn' as const:'square' as const,to:'wash-court' as const,length:cost(.45),direction:'south' as const}]:[]),
    { id: 'workshop', from: 'courtyard', to: 'workshop', length: workshop, direction: 'east' },
    { id: 'garden', from: 'square', to: 'garden', length: long, direction: 'north' },
    { id: 'gate', from: 'workshop', to: 'gate', length: long, direction: 'north' },
    {id:'crosslane',from:'garden',to:'gate',length:square+workshop,direction:'east'},
    {id:'bridge',from:'gate',to:'bridge',length:cost(.5),direction:'east'},
    {id:'relay',from:'bridge',to:'relay',length:cost(.5),direction:'north'},
    {id:'cemetery',from:'garden',to:'cemetery',length:cost(1),direction:'west'},
    {id:'ridge',from:'cemetery',to:'ridge',length:cost(.5),direction:'north'},
    {id:'reservoir',from:'relay',to:'reservoir',length:cost(.5),direction:'east'},
    ...(run.navigation?.openRetreat ? [{ id: 'outskirts' as const, from: origin > 0 ? 'approach' as const : 'start' as const, to: 'outskirts' as const, length: retreat, direction: 'west' as const }] : []),
    ...(origin > 0 ? [{ id: 'approach' as const, from: 'approach' as const, to: 'start' as const, length: origin, direction: 'east' as const }] : []),
  ];
  return { places, edges };
}
export function currentNode(run: Run): Place | undefined {
  const nav = run.navigation;
  if (!nav) return undefined;
  const edge = worldGraph(run).edges.find(item => item.id === nav.edge)!;
  return nav.offset === 0 ? edge.from : nav.offset === edge.length ? edge.to : undefined;
}
export function positionOn(run: Run, nav: Navigation): Point {
  const graph = worldGraph(run), edge = graph.edges.find(item => item.id === nav.edge)!;
  const start = graph.places[edge.from], end = graph.places[edge.to], ratio = nav.offset / edge.length;
  return { x: Math.round(start.x + (end.x - start.x) * ratio), y: Math.round(start.y + (end.y - start.y) * ratio) };
}
// Materialize the old linear projection once; already displayed travel is paid once.
export function enableNavigation(run: Run): { navigation: Navigation; reserve: number } {
  const graph = worldGraph(run), street = graph.edges[0].length, courtyard = graph.edges[1].length;
  const beyondOffice = !['street', 'job', 'rest'].includes(run.stage);
  const offset = run.stage === 'street' ? Math.min(run.reserve, street) : run.stage === 'delivery' ? Math.min(run.reserve, courtyard) : beyondOffice ? courtyard : street;
  const edge: EdgeId = beyondOffice ? 'courtyard' : 'street';
  const walking = run.stage === 'street' || run.stage === 'delivery';
  const walked: Partial<Record<EdgeId, { min: number; max: number }>> = beyondOffice ? { street: { min: 0, max: street }, courtyard: { min: 0, max: offset } } : { street: { min: 0, max: offset } };
  const approach = graph.edges.find(item => item.id === 'approach');
  if (approach) walked.approach = { min: 0, max: approach.length };
  return { reserve: run.reserve - (walking ? offset : 0), navigation: { edge, offset, heading: walking && offset < (beyondOffice ? courtyard : street) ? 1 : null, authorized: ['street', ...(beyondOffice ? ['courtyard' as const] : []), ...(approach ? ['approach' as const] : [])], walked } };
}
export function availableDirections(run: Run): Partial<Record<Direction, { edge: EdgeId; heading: 1 | -1 }>> {
  if (!run.navigation) return {};
  const nav = run.navigation, node = currentNode(run), result: ReturnType<typeof availableDirections> = {};
  for (const edge of worldGraph(run).edges) {
    if (!nav.authorized.includes(edge.id)) continue;
    if (node === edge.from || (!node && nav.edge === edge.id && nav.offset < edge.length)) result[edge.direction] = { edge: edge.id, heading: 1 };
    if (node === edge.to || (!node && nav.edge === edge.id && nav.offset > 0)) result[opposite[edge.direction]] = { edge: edge.id, heading: -1 };
  }
  return result;
}
export function selectDirection(run: Run, direction: Direction): Navigation {
  const choice = availableDirections(run)[direction];
  if (!choice || !run.navigation) throw new Error('Direction unavailable');
  const edge = worldGraph(run).edges.find(item => item.id === choice.edge)!;
  return { ...run.navigation, edge: edge.id, offset: run.navigation.edge === edge.id ? run.navigation.offset : choice.heading === 1 ? 0 : edge.length, heading: choice.heading, lastHeading: choice.heading };
}
export function advanceNavigation(run: Run): Run {
  let next = run;
  // Start/approach are transit points; authored intersections still stop movement.
  for (let hop = 0; hop < 4; hop++) {
    const nav = next.navigation;
    if (!nav?.heading) break;
    const edge = worldGraph(next).edges.find(item => item.id === nav.edge)!;
    const unlimited = edge.id === 'outskirts' && nav.heading === 1;
    const amount = unlimited ? next.reserve : Math.min(next.reserve, nav.heading === 1 ? edge.length - nav.offset : nav.offset);
    const offset = nav.offset + nav.heading * amount, previous = nav.walked[edge.id];
    if (!Number.isSafeInteger(offset)) throw new Error('Travel distance overflow');
    const reached = !unlimited && (nav.heading === 1 ? offset === edge.length : offset === 0);
    next = { ...next, reserve: next.reserve - amount, navigation: { ...nav, odometer:(nav.odometer ?? 0)+amount, offset, heading: reached ? null : nav.heading,
      walked: amount > 0 ? { ...nav.walked, [edge.id]: { min: Math.min(previous?.min ?? nav.offset, offset), max: Math.max(previous?.max ?? nav.offset, offset) } } : nav.walked } };
    if (!reached || !nav.openRetreat) break;
    const node = currentNode(next);
    if (node === 'office' && !['street', 'job'].includes(next.stage) && next.events.some(event => event.type === 'cross') && !next.events.some(event => event.type === 'accept')) {
      next = { ...next, stage: 'job', destination: undefined };
    }
    if (node !== 'start' && node !== 'approach') break;
    const direction = nav.heading === 1 ? edge.direction : opposite[edge.direction];
    if (!availableDirections(next)[direction]) break;
    next = { ...next, navigation: selectDirection(next, direction) };
    if (next.reserve === 0) break;
  }
  return next;
}
export function authorizeRoute(run: Run, edge: EdgeId): Navigation {
  if (!run.navigation) throw new Error('Navigation unavailable');
  return { ...run.navigation, authorized: [...new Set([...run.navigation.authorized, edge])] };
}
export function atPlace(run: Run, place: Place): boolean {
  return run.navigation ? currentNode(run) === place : true;
}
export function questPlace(run: Run): Place | undefined {
  if (run.stage === 'campaign') { const focus=run.campaign.focus; const rule=letterRules.find(rule=>rule.id===focus?.id); return rule ? focus?.returning ? rule.from : rule.to : undefined; }
  if (['street', 'job', 'rest'].includes(run.stage)) return 'office';
  if (['delivery', 'handover', 'settlement', 'complete', 'failed'].includes(run.stage)) return 'courtyard';
  if (run.stage === 'square' || run.stage === 'workshop') return run.stage;
  if (run.stage === 'errand') return run.errand?.from === 'square' ? 'garden' : 'gate';
  if (run.stage === 'errand-return') return run.errand?.from;
  return run.destination;
}
export function questReady(run: Run): boolean {
  if (!run.navigation) return ['street', 'delivery'].includes(run.stage) ? run.reserve >= Math.max(1, Math.ceil(run.goal * (run.stage === 'street' ? .02 : .1))) : true;
  const target = questPlace(run);
  return target ? currentNode(run) === target : true;
}
export function currentLeg(run: Run): { current: number; required: number } {
  const nav = run.navigation;
  if (!nav) return { current: run.reserve, required: Math.max(1, Math.ceil(run.goal * (run.stage === 'street' ? .02 : .1))) };
  const edge = worldGraph(run).edges.find(item => item.id === nav.edge)!;
  const target = questPlace(run), heading = target === edge.from ? -1 : target === edge.to ? 1 : nav.heading ?? nav.lastHeading ?? 1;
  return { current: heading === -1 ? edge.length - nav.offset : nav.offset, required: edge.length };
}

export function remainingQuestSteps(run: Run): number | undefined {
  const target = questPlace(run), nav = run.navigation;
  if (!target) return undefined;
  if (!nav) return Math.max(0, Math.max(1, Math.ceil(run.goal * (run.stage === 'street' ? .02 : .1))) - run.reserve);
  const graph = worldGraph(run), edge = graph.edges.find(item => item.id === nav.edge)!;
  const distance = new Map<Place, number>([[edge.from, nav.offset], [edge.to, edge.length - nav.offset]]);
  const visited = new Set<Place>();
  while (true) {
    const candidate = [...distance].filter(([place]) => !visited.has(place)).sort((a, b) => a[1] - b[1])[0];
    if (!candidate) return undefined;
    const [place, cost] = candidate;
    if (place === target) return cost;
    visited.add(place);
    for (const road of graph.edges.filter(item => nav.authorized.includes(item.id))) {
      const other = road.from === place ? road.to : road.to === place ? road.from : undefined;
      if (other && cost + road.length < (distance.get(other) ?? Infinity)) distance.set(other, cost + road.length);
    }
  }
}


/** Explicit discovery migration; old events keep their original geometry until this event. */
export function revealWashPassage(run:Run):Navigation {
 const nav=run.navigation;if(!nav||run.campaign.washPassage)throw new Error('Passage cannot be revealed');
 const square=worldGraph(run).edges.find(edge=>edge.id==='square')!, half=Math.floor(square.length/2);
 const authorized=[...new Set([...nav.authorized,'wash-lane' as const,...(square.length>=2?['square-west' as const]:[])])];
 if(square.length<2)return {...nav,authorized};
 const walked={...nav.walked},range=walked.square;
 delete walked.square;
 if(range&&range.min<=half)walked.square={min:range.min,max:Math.min(range.max,half)};
 if(range&&range.max>=half)walked['square-west']={min:Math.max(0,range.min-half),max:range.max-half};
 const beyond=nav.edge==='square'&&nav.offset>half;
 return {...nav,authorized,walked,...(beyond?{edge:'square-west' as const,offset:nav.offset-half}:{}),...(nav.edge==='square'&&nav.offset===half?{heading:null}:{})};
}
