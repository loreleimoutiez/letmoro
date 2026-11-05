import { Capacitor, registerPlugin } from '@capacitor/core';
import { parseStepSnapshot } from '../health/steps.ts';
import type { StepSnapshot } from '../health/steps.ts';

interface HealthStepsPlugin {
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
