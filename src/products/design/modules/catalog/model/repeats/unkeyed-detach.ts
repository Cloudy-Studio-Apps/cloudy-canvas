import type { BrochureRepeat } from "./brochure-repeat.types";

/**
 * Whether a repeat has copies or pages taken out by hand (detached or deleted) and no `key`: they're
 * then tied to row positions, so a list that loses or reorders rows moves them to other rows.
 */
export function unkeyedDetach(repeat: BrochureRepeat): boolean {
  if (repeat.key) return false;
  return repeat.detached.length > 0 || (repeat.detachedPages?.length ?? 0) > 0;
}
