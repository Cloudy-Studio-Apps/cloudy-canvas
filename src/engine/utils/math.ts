export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Modulo that is always positive (JS `%` keeps the sign of the dividend). */
export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}
