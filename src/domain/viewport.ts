export const MIN_ZOOM = .0001;
export const MAX_ZOOM = 3;
export function clampZoom(value: number, minimum = MIN_ZOOM): number { return Math.max(minimum, Math.min(MAX_ZOOM, value)); }
export function wheelZoom(current: number, delta: number, minimum = MIN_ZOOM): number { return clampZoom(current * Math.exp(-Math.max(-500, Math.min(500, delta)) * .002), minimum); }
