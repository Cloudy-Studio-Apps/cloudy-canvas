import { normalizeRuns, runStyleAt, sameRunStyle } from "@canvas";

import type { DesignNode } from "../../core";
import { isText, type TextNodeRun, type TextRunStyle } from "../../text";
import { dataFieldsOf } from "./binding-fields";
import { resolveDataText } from "./resolve-data-text";
import type { DataTemplate } from "./binding.types";
import type { ResolvedTemplate } from "./resolve-template.types";
import type { DataScope } from "./scope.types";

/** A style change: each changed field's new value, `null` for one cleared. */
type StyleChange = Record<string, unknown>;

function changeBetween(expected: object, shown: object): StyleChange {
  const e = expected as Record<string, unknown>;
  const s = shown as Record<string, unknown>;
  const out: StyleChange = {};
  for (const key of new Set([...Object.keys(e), ...Object.keys(s)])) {
    if (e[key] === undefined && s[key] === undefined) continue;
    if (JSON.stringify(e[key]) !== JSON.stringify(s[key])) out[key] = s[key] ?? null;
  }
  return out;
}

function sameChange(a: StyleChange, b: StyleChange): boolean {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => key in b && JSON.stringify(a[key]) === JSON.stringify(b[key]))
  );
}

/** The one change over shown characters `from` to `to`, `null` when they changed differently. */
function changeOver(
  expected: readonly TextNodeRun[],
  shown: readonly TextNodeRun[],
  from: number,
  to: number,
): StyleChange | null {
  let first: StyleChange | null = null;
  for (let i = from; i < to; i++) {
    const change = changeBetween(runStyleAt(expected, i), runStyleAt(shown, i));
    if (!first) first = change;
    else if (!sameChange(first, change)) return null;
  }
  return first;
}

function applyChange(style: Partial<TextRunStyle>, change: StyleChange): TextRunStyle {
  const out: Record<string, unknown> = { ...style };
  for (const [key, value] of Object.entries(change)) {
    if (value === null) delete out[key];
    else out[key] = value;
  }
  return out as TextRunStyle;
}

function sameRuns(a: readonly TextNodeRun[], b: readonly TextNodeRun[]): boolean {
  return (
    a.length === b.length &&
    a.every((run, i) => {
      const other = b[i];
      return (
        !!other &&
        run.start === other.start &&
        run.end === other.end &&
        sameRunStyle(run.style, other.style)
      );
    })
  );
}

/**
 * The template's runs carrying a style edit of the shown runs made outside the editor (the
 * Typography section on the whole text, a text style's change, an agent's runs): each piece of
 * the template (a character, `{{`, a token) takes the change its shown text got. A token whose
 * text changed in different ways can't hold that and keeps its style (the sync then shows it
 * again); a token that came out empty takes the change when the whole text got the same one.
 * `null` when the shown runs are the template's own or nothing can be carried.
 */
export function carryRunEdit(
  template: DataTemplate,
  resolved: ResolvedTemplate,
  shown: readonly TextNodeRun[],
): TextNodeRun[] | null {
  const expected = normalizeRuns(resolved.runs, resolved.text.length);
  const actual = normalizeRuns(shown, resolved.text.length);
  if (sameRuns(expected, actual)) return null;
  const changes = resolved.spans.map((span) =>
    span.to > span.from ? changeOver(expected, actual, span.from, span.to) : undefined,
  );
  const written = changes.filter((change) => change !== undefined);
  const head = written[0];
  const shared =
    head && written.every((change) => change !== null && sameChange(change, head)) ? head : null;
  const pieces: TextNodeRun[] = [];
  resolved.spans.forEach((span, i) => {
    const change = changes[i] === undefined ? shared : changes[i];
    for (let j = span.start; j < span.end; j++) {
      const own = runStyleAt(template.runs, j);
      pieces.push({ start: j, end: j + 1, style: change ? applyChange(own, change) : own });
    }
  });
  const runs = normalizeRuns(pieces, template.text.length);
  return sameRuns(runs, normalizeRuns(template.runs, template.text.length)) ? null : runs;
}

/**
 * A bound text's template with the style edit of its shown runs carried over (`carryRunEdit`),
 * when the text still reads what the template gives; `null` when there's nothing to carry.
 */
export function carriedTemplate(
  el: DesignNode,
  scope: DataScope,
  locale: string,
): DataTemplate | null {
  const template = dataFieldsOf(el).dataText;
  if (!template || !isText(el)) return null;
  const resolved = resolveDataText(template, scope, locale);
  if (!resolved || resolved.text !== el.text) return null;
  const runs = carryRunEdit(template, resolved, el.runs);
  return runs ? { text: template.text, runs } : null;
}
