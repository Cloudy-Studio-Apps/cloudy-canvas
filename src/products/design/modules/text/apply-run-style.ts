import { readTextStyle } from "./text-style";
import type { TextNodeRun, TextRunStyle, TextStyleValue } from "./text.types";

/** Where a text's ranges are bound to a text style: `runs.textStyle.<style id>`. */
export const RUN_STYLE_PREFIX = "runs.textStyle.";

/** The typography fields a text style sets on a range. */
const STYLED_FIELDS: readonly (keyof TextRunStyle)[] = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textDecoration",
];

/** The text styles a text's ranges use, each once. */
export function runStyleIds(runs: readonly TextNodeRun[]): string[] {
  return [...new Set(runs.flatMap((run) => (run.style.textStyle ? [run.style.textStyle] : [])))];
}

/** The runs with the style's typography over each range that uses it (the others unchanged). */
export function applyRunStyle(
  runs: readonly TextNodeRun[],
  styleId: string,
  value: Partial<TextStyleValue>,
): TextNodeRun[] {
  return runs.map((run) =>
    run.style.textStyle === styleId ? { ...run, style: { ...run.style, ...value } } : run,
  );
}

/** What applying a text style to a range sets: its typography and its id. */
export function runStylePatch(
  styleId: string,
  value: Readonly<Record<string, unknown>>,
): Partial<TextRunStyle> {
  return { ...readTextStyle(value), textStyle: styleId };
}

/**
 * A range patch written by hand: one setting typography without naming a style unlinks the
 * range's style (`textStyle: undefined` clears it), as the detach rule does for layers.
 */
export function unstyledRangePatch<P extends Partial<TextRunStyle>>(patch: P): P {
  if ("textStyle" in patch) return patch;
  const styled = STYLED_FIELDS.some((field) => field in patch);
  return styled ? { ...patch, textStyle: undefined } : patch;
}
