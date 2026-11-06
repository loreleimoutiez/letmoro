import type { Run } from './prologue.ts';

export const directions = ['north', 'east', 'south', 'west'] as const;
export type Direction = typeof directions[number];
export type Place = 'start' | 'approach' | 'office' | 'courtyard' | 'square' | 'workshop' | 'garden' | 'gate';
export type Neighborhood = 'square' | 'workshop';
export type EdgeId = 'approach' | 'street' | 'courtyard' | 'square' | 'workshop' | 'garden' | 'gate';
export interface Point { x: number; y: number }
export interface Edge { id: EdgeId; from: Place; to: Place; length: number; direction: Direction }
export interface Navigation {
  readonly edge: EdgeId;
  readonly offset: number;
  readonly heading: 1 | -1 | null;
  readonly lastHeading?: 1 | -1;
  readonly authorized: readonly EdgeId[];
  readonly walked: Readonly<Partial<Record<EdgeId, Readonly<{ min: number; max: number }>>>>;
}
const opposite: Record<Direction, Direction> = { north: 'south', south: 'north', east: 'west', west: 'east' };
export function worldGraph(run: Run) {
  const cost = (ratio: number) => Math.max(1, Math.ceil(run.goal * ratio));
  const street = cost(.02), courtyard = cost(.1), square = cost(.35), workshop = cost(.5), long = cost(2);
  const origin = run.journeyOrigin ?? (run.healthKey ? run.walkedSteps : 0);
  const places: Record<Place, Point> = {
    approach: { x: -origin, y: 0 }, start: { x: 0, y: 0 }, office: { x: street, y: 0 },
    courtyard: { x: street, y: -courtyard }, square: { x: street - square, y: -courtyard },
    workshop: { x: street + workshop, y: -courtyard }, garden: { x: street - square, y: -courtyard - long }, gate: { x: street + workshop, y: -courtyard - long },
  };
  const edges: Edge[] = [
    { id: 'street', from: 'start', to: 'office', length: street, direction: 'east' },
    { id: 'courtyard', from: 'office', to: 'courtyard', length: courtyard, direction: 'north' },
    { id: 'square', from: 'courtyard', to: 'square', length: square, direction: 'west' },
    { id: 'workshop', from: 'courtyard', to: 'workshop', length: workshop, direction: 'east' },
    { id: 'garden', from: 'square', to: 'garden', length: long, direction: 'north' },
    { id: 'gate', from: 'workshop', to: 'gate', length: long, direction: 'north' },
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
  const nav = run.navigation;
  if (!nav || !nav.heading || run.reserve === 0) return run;
  const edge = worldGraph(run).edges.find(item => item.id === nav.edge)!;
  const amount = Math.min(run.reserve, nav.heading === 1 ? edge.length - nav.offset : nav.offset);
  const offset = nav.offset + nav.heading * amount, previous = nav.walked[edge.id];
  return { ...run, reserve: run.reserve - amount, navigation: { ...nav, offset, heading: offset === 0 || offset === edge.length ? null : nav.heading, walked: { ...nav.walked, [edge.id]: { min: Math.min(previous?.min ?? nav.offset, offset), max: Math.max(previous?.max ?? nav.offset, offset) } } } };
}
export function authorizeRoute(run: Run, edge: EdgeId): Navigation {
  if (!run.navigation) throw new Error('Navigation unavailable');
  return { ...run.navigation, authorized: [...new Set([...run.navigation.authorized, edge])] };
}
export function atPlace(run: Run, place: Place): boolean {
  return run.navigation ? currentNode(run) === place : true;
}
export function questPlace(run: Run): Place | undefined {
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
