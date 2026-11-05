import { Capacitor, registerPlugin } from '@capacitor/core';
import { parseStepSnapshot } from '../health/steps.ts';
import type { StepSnapshot } from '../health/steps.ts';

interface HealthStepsPlugin {
  addListener(name: 'stepUpdate', listener: (snapshot: unknown) => void): Promise<{ remove: () => Promise<void> }>;
  startLiveSteps(options: { request: boolean; minimumTotal: number }): Promise<unknown>;
  stopLiveSteps(): Promise<void>;
  readToday(): Promise<unknown>;
  requestAccess(): Promise<unknown>;
  openSettings(): Promise<void>;
}
const native = registerPlugin<HealthStepsPlugin>('HealthSteps');
export const supportsHealth = Capacitor.getPlatform() === 'android';
const unavailable: StepSnapshot = { status: 'unavailable', count: null, checkedAt: null };
export async function readTodaySteps(): Promise<StepSnapshot> {
  return supportsHealth ? parseStepSnapshot(await native.readToday()) : unavailable;
}
export async function connectSteps(): Promise<StepSnapshot> {
  return supportsHealth ? parseStepSnapshot(await native.requestAccess()) : unavailable;
}
export async function openHealthSettings() { if (supportsHealth) await native.openSettings(); }

export async function enableLiveSteps(request: boolean, minimumTotal: number): Promise<StepSnapshot> {
  return supportsHealth ? parseStepSnapshot(await native.startLiveSteps({ request, minimumTotal })) : unavailable;
}
export async function listenToSteps(listener: (snapshot: StepSnapshot) => void) {
  if (!supportsHealth) return { remove: async () => {} };
  return native.addListener('stepUpdate', raw => { try { listener(parseStepSnapshot(raw)); } catch { /* Ignore malformed sensor events. */ } });
}

export async function stopLiveSteps() { if (supportsHealth) await native.stopLiveSteps(); }
