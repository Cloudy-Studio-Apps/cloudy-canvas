import type { RepeatBracketProps } from "./repeat-marks.types";
import { INDENT_PX } from "./page-list.constants";

/**
 * A repeat run's bracket on a row of the page list: a line down its left edge at the run's depth,
 * which reads as one bracket over the template, its copies and the pages still to make.
 */
export function RepeatBracket({ depth }: RepeatBracketProps) {
  if (depth === null) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary"
      style={{ left: 1 + depth * INDENT_PX }}
    />
  );
}
