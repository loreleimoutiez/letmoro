import type { Run } from './prologue.ts';

// One imported step is one CSS world pixel at 1× zoom; effort still scales to goal.
export const PIXELS_PER_STEP = 1;
export function routeGeometry(run: Run | null) {
  const street = Math.max(1, Math.ceil((run?.goal ?? 5000) * .02)) * PIXELS_PER_STEP;
  const courtyard = Math.max(1, Math.ceil((run?.goal ?? 5000) * .1)) * PIXELS_PER_STEP;
  const origin = run?.journeyOrigin ?? run?.walkedSteps ?? 0;
  return { office: origin + street, crossing: origin + street * .7, courtyard: origin + street + courtyard, origin, street };
}
export function discoveredDistance(run: Run | null): number {
  if (!run) return 0;
  const route = routeGeometry(run);
  if (run.journeyOrigin === undefined && run.healthKey) return run.walkedSteps;
  if (run.stage === 'street') return route.origin + Math.min(run.reserve * PIXELS_PER_STEP, route.street);
  if (run.stage === 'delivery') return route.office + Math.min(run.reserve * PIXELS_PER_STEP, route.courtyard - route.office);
  if (run.stage === 'job' || run.stage === 'rest') return route.office;
  return route.courtyard;
}
