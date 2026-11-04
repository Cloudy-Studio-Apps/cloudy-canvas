import { normalizeRuns, type ElementPatch } from "@canvas";

import { sameTextContent } from "./same-text-content";
import type { TextTemplates, TextTemplateSource } from "./text.points.types";
import type { TextNodeElement, TextNodeRun } from "./text.types";

/** The first template source that claims this text, if any. */
export function templateOf(
  templates: TextTemplates,
  el: TextNodeElement,
): TextTemplateSource | undefined {
  return templates().find((source) => source.claims(el));
}

/**
 * What writes an edit of a text through its template: `null` when the template is unchanged,
 * otherwise only the source's write (the shown text follows from it, e.g. the data sync).
 */
export function templateCommit(
  source: TextTemplateSource,
  el: TextNodeElement,
  text: string,
  runs: readonly TextNodeRun[],
): ElementPatch<TextNodeElement> | null {
  const current = source.read(el);
  const normalized = normalizeRuns(runs, text.length);
  if (sameTextContent(text, normalized, current.text, current.runs)) return null;
  return source.write(el, text, normalized);
}
