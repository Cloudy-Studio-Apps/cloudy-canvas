import { resolveVariable, TokenStore, type CanvasDocument, type EditedChange } from "@canvas";

import { DESIGN_TOKEN_CONTEXT } from "../core";
import { RUN_STYLE_PREFIX, runStyleIds } from "./apply-run-style";
import { readTextStyle } from "./text-style";
import type { TextNodeElement, TextNodeRun } from "./text.types";

/** Numbers closer than this are the same (as the token sync compares them). */
const EPSILON = 1e-3;

function same(a: unknown, b: unknown): boolean {
  return typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < EPSILON : a === b;
}

/**
 * The runs with `textStyle` cleared where the range no longer shows its style: the style is gone,
 * or its typography was changed by hand (the Scale tool, an agent's `update_nodes`). `null` when
 * nothing changes.
 */
function unlinkedRuns(doc: CanvasDocument, el: TextNodeElement): TextNodeRun[] | null {
  if (!el.runs.some((run) => run.style.textStyle)) return null;
  const store = TokenStore.of(doc);
  const modes = DESIGN_TOKEN_CONTEXT.modesOf(doc, el);
  let changed = false;
  const runs = el.runs.map((run) => {
    const id = run.style.textStyle;
    if (!id) return run;
    const resolved = store.style(id) ? resolveVariable(store, id, modes) : null;
    const value = resolved?.type === "style" ? readTextStyle(resolved.value) : null;
    const own = run.style as Record<string, unknown>;
    if (value && Object.entries(value).every(([field, v]) => same(own[field], v))) return run;
    changed = true;
    const style = { ...run.style };
    delete style.textStyle;
    return { ...run, style };
  });
  return changed ? runs : null;
}

/**
 * The runs after an edit of the text's own range-style bindings (not of its runs): a style whose
 * binding was removed (detached) leaves its ranges, one whose binding now names another style
 * (replaced) gives its ranges that style. `null` when the bindings' edit says nothing about runs.
 */
function followedRuns(
  el: TextNodeElement,
  before: Readonly<Record<string, unknown>> | undefined,
): TextNodeRun[] | null {
  if (!before || !("bindings" in before) || "runs" in before) return null;
  const was = (before.bindings ?? {}) as Record<string, string>;
  const now = el.bindings ?? {};
  const styleOf = (bindings: Record<string, string>) =>
    new Set(
      Object.entries(bindings)
        .filter(([path]) => path.startsWith(RUN_STYLE_PREFIX))
        .map(([path, target]) => `${path.slice(RUN_STYLE_PREFIX.length)}=${target}`),
    );
  const old = styleOf(was);
  const fresh = styleOf(now);
  const gone = [...old].filter((entry) => !fresh.has(entry));
  if (gone.length === 0) return null;
  // A binding still at a style's path but naming another style is a replace; else a detach.
  const renamed = new Map<string, string | null>();
  for (const entry of gone) {
    const id = entry.slice(0, entry.indexOf("="));
    const target = now[`${RUN_STYLE_PREFIX}${id}`];
    const added = [...fresh].find((e) => !old.has(e))?.split("=")[1];
    renamed.set(id, target ?? added ?? null);
  }
  let changed = false;
  const runs = el.runs.map((run) => {
    const id = run.style.textStyle;
    if (!id || !renamed.has(id)) return run;
    changed = true;
    const style = { ...run.style };
    const to = renamed.get(id);
    if (to) style.textStyle = to;
    else delete style.textStyle;
    return { ...run, style };
  });
  return changed ? runs : null;
}

/**
 * An `afterEdit` hook: each edited text is bound to exactly the text styles its ranges use
 * (`runs.textStyle.<id>`), so the token sync restyles them when a style changes. Ranges carry the
 * style; the bindings follow them, so typing, splitting and clearing need nothing else. A range
 * that stopped showing its style (or whose style was deleted) is unlinked first.
 */
export function syncRunStyleBindings(doc: CanvasDocument, change: EditedChange): void {
  const patches = new Map<string, Partial<TextNodeElement>>();
  for (const id of change.updated) {
    if (doc.field(id, "type") !== "text") continue;
    const el = doc.get(id) as TextNodeElement | undefined;
    if (!el) continue;
    // Bindings edited on their own (detached, replaced) lead the runs; otherwise runs lead.
    const followed = followedRuns(el, change.before.get(id));
    const current = followed ? { ...el, runs: followed } : el;
    const unlinked = unlinkedRuns(doc, current) ?? followed;
    const runs = unlinked ?? el.runs;
    const bindings = el.bindings ?? {};
    const next: Record<string, string> = {};
    for (const [path, target] of Object.entries(bindings)) {
      if (!path.startsWith(RUN_STYLE_PREFIX)) next[path] = target;
    }
    for (const style of runStyleIds(runs)) next[`${RUN_STYLE_PREFIX}${style}`] = style;
    const sameBindings =
      Object.keys(next).length === Object.keys(bindings).length &&
      Object.entries(next).every(([path, target]) => bindings[path] === target);
    if (unlinked || !sameBindings) {
      patches.set(id, { ...(unlinked ? { runs: unlinked } : {}), bindings: next });
    }
  }
  if (patches.size > 0) doc.updateMany(patches);
}
