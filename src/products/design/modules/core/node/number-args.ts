// Checks of the numbers agents give nodes; each throws naming the field.

/** A number from 0 to 1 (an opacity). */
export function fraction(value: unknown, key: string): number {
  if (typeof value !== "number" || !(value >= 0 && value <= 1)) {
    throw new Error(`"${key}" must be a number from 0 to 1.`);
  }
  return value;
}

/** A number of at least 0 (a radius, a weight). */
export function nonNegative(value: unknown, key: string): number {
  if (typeof value !== "number" || !(value >= 0) || value === Infinity) {
    throw new Error(`"${key}" must be a number of at least 0.`);
  }
  return value;
}

/** A whole number from `min` to `max` (a point count). */
export function wholeNumber(value: unknown, key: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`"${key}" must be a whole number from ${min} to ${max}.`);
  }
  return value;
}

/** A world point `{ x, y }`. */
export function pointArg(value: unknown, key: string): { x: number; y: number } {
  const p = value as { x?: unknown; y?: unknown } | null;
  if (
    typeof p !== "object" ||
    p === null ||
    typeof p.x !== "number" ||
    typeof p.y !== "number" ||
    !Number.isFinite(p.x) ||
    !Number.isFinite(p.y)
  ) {
    throw new Error(`"${key}" must be a point { x, y }.`);
  }
  return { x: p.x, y: p.y };
}
