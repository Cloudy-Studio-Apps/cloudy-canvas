import { generateNKeysBetween } from "fractional-indexing";

import {
  elementSpec,
  resolveVariable,
  type CanvasDocument,
  type CanvasElement,
  type ElementKinds,
  type ElementPatch,
} from "@canvas";

import { DESIGN_TOKEN_CONTEXT, isNodeKind, type DesignNode } from "../../core";
import type { GeneratedSpec } from "../styleguide.types";
import { SHEET_LAYOUT } from "./create-sheet";
import { generatedMark } from "./is-sheet";
import type { ReconcileContext } from "./reconcile-sheet.types";
import type { SheetFrame } from "./sheet.types";

/** Whether two plain JSON values are the same (fields of the document are). */
function same(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

/** Fields regenerating never writes on a layer it already made (auto layout places them). */
const KEPT = new Set(["id", "type", "x", "y", "index", "pageId", "locked", "generated"]);

/** The fields `bindings` set on `el` (the token sync writes them; writing them here would unlink). */
function boundFields(
  el: CanvasElement,
  bindings: Readonly<Record<string, string>>,
  kinds: ElementKinds,
  doc: CanvasDocument,
  store: ReconcileContext["store"],
): Set<string> {
  const fields = new Set<string>();
  const kind = kinds.kindOf(el);
  const modes = DESIGN_TOKEN_CONTEXT.modesOf(doc, el);
  for (const [path, id] of Object.entries(bindings)) {
    fields.add(path.split(".")[0] ?? path);
    const value = resolveVariable(store, id, modes);
    if (!value) continue;
    for (const leaf of Object.keys(kind.bindValues(el, path, value))) {
      fields.add(leaf.split(".")[0] ?? leaf);
    }
  }
  return fields;
}

/**
 * Writes `specs` as the sheet's children: each layer it made before is matched by its key and
 * patched with what changed (a key whose type changed is made again), new ones are built through
 * their kinds, siblings are put in order and the layers no spec asks for are removed. Positions
 * and hugged sizes are left to auto layout, and bound fields to the token sync. The sheet keeps
 * its own fill and name; its layout is set again.
 */
export function reconcileSheet(
  doc: CanvasDocument,
  kinds: ElementKinds,
  sheet: SheetFrame,
  specs: readonly GeneratedSpec[],
  existing: readonly CanvasElement[],
  context: ReconcileContext,
): void {
  const byKey = new Map<string, CanvasElement>();
  for (const el of existing) {
    const mark = generatedMark(el);
    if (mark) byKey.set(mark.key, el);
  }
  const used = new Set<string>();
  const patches = new Map<string, ElementPatch>();

  const write = (spec: GeneratedSpec, key: string, parentId: string, index: string): void => {
    const kind = kinds.get(String(spec.args.type));
    if (!kind || !isNodeKind(kind)) return;
    let fresh: DesignNode;
    try {
      fresh = kind.buildNode(elementSpec(spec.args), index, {
        kinds,
        lookup: () => undefined,
        options: context.options,
        nameFor: (base) => base,
      });
    } catch (error) {
      // A template's bad spec (a plugin's) leaves that layer out; the edit itself goes on.
      console.warn(`The design system couldn't make "${key}":`, error);
      return;
    }
    const node: DesignNode = {
      ...fresh,
      parentId,
      pageId: sheet.pageId,
      locked: true,
      ...(spec.bindings ? { bindings: spec.bindings } : {}),
      ...(spec.variableModes ? { variableModes: spec.variableModes } : {}),
      generated: { sheet: sheet.id, key },
    } as DesignNode;
    const old = byKey.get(key);
    let id: string;
    if (old && old.type === node.type && !used.has(old.id)) {
      id = old.id;
      used.add(id);
      const skip = boundFields(old, spec.bindings ?? {}, kinds, doc, context.store);
      const sizing = (node as { sizing?: { h?: string; v?: string } }).sizing;
      if (sizing?.h === "hug") skip.add("w");
      if (sizing?.v === "hug") skip.add("h");
      const patch: Record<string, unknown> = {};
      const was = old as unknown as Record<string, unknown>;
      for (const [field, value] of Object.entries(node)) {
        if (KEPT.has(field) || skip.has(field)) continue;
        if (!same(was[field], value)) patch[field] = value;
      }
      // A field can't be deleted through a patch: an empty map means none.
      if (!spec.bindings && !same(was.bindings ?? {}, {})) patch.bindings = {};
      if (!spec.variableModes && !same(was.variableModes ?? {}, {})) patch.variableModes = {};
      if (old.index !== index) patch.index = index;
      if (Object.keys(patch).length > 0) patches.set(id, patch as ElementPatch);
    } else {
      id = node.id;
      doc.add(node);
    }
    writeChildren(spec.children ?? [], id, index, key);
  };
  // Children sort after their parent (as everywhere else in a design): exports and anything
  // that orders by `index` alone then still draw them above it.
  const writeChildren = (
    children: readonly GeneratedSpec[],
    parentId: string,
    parentIndex: string,
    parentKey: string,
  ): void => {
    const indexes = generateNKeysBetween(parentIndex, null, children.length);
    // A layer is matched by its key's whole path from the sheet (templates reuse short keys like
    // "swatch" in every item), and a key repeated among siblings gets a number.
    const seen = new Map<string, number>();
    children.forEach((child, i) => {
      const count = seen.get(child.key) ?? 0;
      seen.set(child.key, count + 1);
      const own = count === 0 ? child.key : `${child.key}#${count}`;
      write(child, parentKey ? `${parentKey}/${own}` : own, parentId, indexes[i]!);
    });
  };

  writeChildren(specs, sheet.id, sheet.index, "");
  if (patches.size > 0) doc.updateMany(patches);
  const stale = existing.filter((el) => !used.has(el.id));
  if (stale.length > 0) {
    // The user's own layers dropped into a frame that goes stay in the sheet.
    const staleIds = new Set(stale.map((el) => el.id));
    const kept = new Map<string, ElementPatch>();
    for (const el of doc.all()) {
      const parentId = (el as { parentId?: string | null }).parentId;
      if (parentId && staleIds.has(parentId) && !staleIds.has(el.id) && !generatedMark(el)) {
        kept.set(el.id, { parentId: sheet.id } as ElementPatch);
      }
    }
    if (kept.size > 0) doc.updateMany(kept);
    doc.remove(staleIds);
  }
  if (!same(sheet.layout, SHEET_LAYOUT) || sheet.sizing.h !== "hug" || sheet.sizing.v !== "hug") {
    doc.update(sheet.id, { layout: SHEET_LAYOUT, sizing: { h: "hug", v: "hug" } } as ElementPatch);
  }
}
