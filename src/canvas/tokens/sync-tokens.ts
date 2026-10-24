import type { CanvasDocument, EditedChange } from "../document";
import type { ElementKinds } from "../elements/element.kinds";
import type { CanvasElement, ElementPatch } from "../elements/element.types";
import { deepEqual } from "../utils";
import { BindingIndex } from "./binding-index";
import { pathRoot, readPath } from "./binding-path";
import type { TokenContext } from "./binding.types";
import { resolveVariable } from "./resolve-token";
import { TokenStore } from "./token-store";

/** Numbers closer than this are the same value (layouts round, resizes clamp to whole units). */
const EPSILON = 1e-3;

const HEX = /^#[0-9a-f]{3,8}$/i;

function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < EPSILON;
  // Colors are stored in either case; any other text (a bound content, a font) must match exactly.
  if (typeof a === "string" && typeof b === "string" && HEX.test(a) && HEX.test(b)) {
    return a.toUpperCase() === b.toUpperCase();
  }
  return deepEqual(a, b);
}

/**
 * Keeps the fields driven by variables true, as an `afterEdit` hook (inside the edit's undo step):
 *
 * 1. A bound field the edit wrote with something other than its variable's value was set by hand
 *    (a drag, the Scale tool, an agent): it's unlinked and keeps what was written.
 * 2. Every element the edit touched with bindings, bound to a variable (or an alias of one) the
 *    edit changed, or whose modes the edit changed, gets its variables' values again. A variable
 *    that can't be resolved (gone, a broken alias) leaves the field as it is; a binding whose
 *    field is gone (its paint removed) is dropped.
 */
export function syncTokens(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
  context: TokenContext,
): void {
  const store = TokenStore.of(doc);
  if (store.isEmpty && change.tokens.size === 0) return;
  const unlinked = detachWritten(doc, change, kinds, context, store);

  const ids = new Set<string>();
  for (const id of change.updated) ids.add(id);
  if (change.tokens.size > 0) {
    for (const id of BindingIndex.of(doc).affectedBy(change.tokens)) ids.add(id);
  }
  const modesChanged = new Set<string>();
  for (const [id, before] of change.before) if ("variableModes" in before) modesChanged.add(id);
  if (modesChanged.size > 0) {
    for (const id of context.modeDependents(doc, modesChanged)) ids.add(id);
  }

  const patches = new Map<string, ElementPatch>();
  for (const id of ids) {
    const el = doc.get(id);
    if (!el?.bindings) continue;
    const patch = resolvedPatch(el, kinds, context.modesOf(doc, el), store, unlinked.get(id));
    if (patch) patches.set(id, patch);
  }
  if (patches.size > 0) doc.updateMany(patches);
}

/** Unlinks the bound fields written by hand (step 1); returns the bindings each element keeps. */
function detachWritten(
  doc: CanvasDocument,
  change: EditedChange,
  kinds: ElementKinds,
  context: TokenContext,
  store: TokenStore,
): Map<string, Record<string, string>> {
  const kept = new Map<string, Record<string, string>>();
  for (const [id, before] of change.before) {
    const el = doc.get(id);
    if (!el?.bindings) continue;
    const kind = kinds.kindOf(el);
    const modes = context.modesOf(doc, el);
    let changed = false;
    const next: Record<string, string> = {};
    for (const [path, variable] of Object.entries(el.bindings)) {
      next[path] = variable;
      const value = resolveVariable(store, variable, modes);
      if (!value) continue;
      const expected = kind.bindValues(el, path, value);
      // A style sets several fields; any of them written counts.
      if (!Object.keys(expected).some((leaf) => pathRoot(leaf) in before)) continue;
      const matches = Object.entries(expected).every(([leaf, v]) =>
        sameValue(readPath(el, leaf), v),
      );
      if (matches) continue;
      delete next[path];
      changed = true;
    }
    if (changed) kept.set(id, next);
  }
  return kept;
}

/** The patch giving an element its variables' values (and its kept bindings), or `null`. */
function resolvedPatch(
  el: CanvasElement,
  kinds: ElementKinds,
  modes: Readonly<Record<string, string>>,
  store: TokenStore,
  keptBindings: Record<string, string> | undefined,
): ElementPatch | null {
  const kind = kinds.kindOf(el);
  const bindings = keptBindings ?? el.bindings ?? {};
  const live: Record<string, string> = {};
  let current: CanvasElement = el;
  // Asked once: a binding stays while the kind still offers its path (style paths included).
  const offered = new Set(kind.bindable(el).map((field) => field.path));
  for (const [path, variable] of Object.entries(bindings)) {
    if (!offered.has(path)) continue;
    live[path] = variable;
    const value = resolveVariable(store, variable, modes);
    if (!value) continue;
    const patch = kind.bindPatch(current, path, value);
    if (patch) current = { ...current, ...patch };
  }
  const patch: Record<string, unknown> = {};
  const fields = current as unknown as Record<string, unknown>;
  const original = el as unknown as Record<string, unknown>;
  for (const key of Object.keys(fields)) {
    if (key !== "id" && key !== "type" && !deepEqual(fields[key], original[key])) {
      patch[key] = fields[key];
    }
  }
  if (!deepEqual(live, el.bindings ?? {})) patch.bindings = live;
  return Object.keys(patch).length > 0 ? patch : null;
}
