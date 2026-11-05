import { readShape } from "../table/check-shape";
import type { DataShape } from "../table/shape.types";

/** A record's `shape` as stored, or `null` when it's missing or malformed (an older or hand-made file). */
export function storedShape(value: unknown): DataShape | null {
  if (value === undefined || value === null) return null;
  try {
    return readShape(value);
  } catch {
    return null;
  }
}
