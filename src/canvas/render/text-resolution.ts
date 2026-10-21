const MAX_TEXT_RESOLUTION = 8;

/** Text resolution that keeps world-space text crisp at `zoom`. */
export function textResolution(zoom: number): number {
  const dpr = window.devicePixelRatio || 1;
  return Math.min(dpr * Math.max(1, Math.ceil(zoom * 2) / 2), MAX_TEXT_RESOLUTION);
}
