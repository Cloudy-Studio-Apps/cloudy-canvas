import { runStyleAt, sameRunStyle } from "@canvas";

import { baseRunStyle } from "./text-spans";
import type { TextNodeElement, TextNodeRun, TextRunStyle } from "./text.types";

/** A text style field the Typography section shows. */
export type TextStyleField = keyof TextRunStyle;

/**
 * A field's value over characters `start` to `end` of a text with `runs` (with only a caret, the
 * character before it), or `null` when they differ ("Mixed").
 */
export function rangeStyleValue<K extends TextStyleField>(
  el: TextNodeElement,
  runs: readonly TextNodeRun[],
  start: number,
  end: number,
  field: K,
): Required<TextRunStyle>[K] | null {
  const base = baseRunStyle(el);
  const from = start === end ? Math.max(0, start - 1) : start;
  const to = start === end ? from + 1 : end;
  let value: Required<TextRunStyle>[K] | undefined;
  for (let i = from; i < Math.max(to, from + 1); i++) {
    const own = { ...base, ...runStyleAt(runs, i) }[field];
    if (value === undefined) value = own;
    else if (!same(value, own)) return null;
  }
  return value ?? base[field];
}

/** A field's value over all of a text (its ranges' own values too), or `null` when they differ. */
export function textStyleValue<K extends TextStyleField>(
  el: TextNodeElement,
  field: K,
): Required<TextRunStyle>[K] | null {
  const value = baseRunStyle(el)[field];
  const covered = el.runs.some((run) => run.start === 0 && run.end >= el.text.length);
  const values = el.runs
    .map((run) => run.style[field])
    .filter((own): own is Required<TextRunStyle>[K] => own !== undefined);
  // A run over the whole text hides the text's own value.
  const all = covered && values.length > 0 ? values : [value, ...values];
  return all.every((other) => same(other, all[0])) ? (all[0] ?? value) : null;
}

function same(a: unknown, b: unknown): boolean {
  return typeof a === "object" && a !== null && typeof b === "object" && b !== null
    ? sameRunStyle(a, b)
    : Object.is(a, b);
}
