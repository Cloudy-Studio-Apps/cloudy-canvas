import type { CanvasDocument, CanvasElement, ElementPatch } from "@canvas";

import { isDesignNode, type DesignNode } from "../../core";
import { readsUnreadable } from "../bindings";
import { descendants } from "./descendants";
import { freedPatch } from "./freed-patch";
import { dataCopyTag, repeatOf } from "./repeat-fields";
import { repeatRows } from "./repeat-rows";
import { scopeAt } from "./scope-at";

/**
 * Detaches an iterator's copy (`copyId`, its root or a layer in it), as one undo step: its key
 * joins the iterator's `detached`, so the sync never updates or replaces it, and the copy and
 * what it holds are untagged, unlocked and lose their data fields (`dataText`, `dataBindings`,
 * `dataVisible`, `dataHideEmpty`, and an iterator's `repeat` inside), keeping what they show now:
 * a detached copy has no row to read. A copy inside another iterator's copy (its iterator, or
 * a frame around it, is a copy) is refused: detach the outer copy first.
 */
export function detachDataCopy(doc: CanvasDocument, copyId: string): void {
  const el = doc.get(copyId);
  const tag = el && isDesignNode(el) ? dataCopyTag(el) : null;
  if (!el || !isDesignNode(el) || !tag)
    throw new Error(`"${copyId}" isn't a copy an iterator made.`);
  let root: DesignNode = el;
  for (const seen = new Set<string>(); root.parentId !== tag.iterator;) {
    seen.add(root.id);
    const parent = root.parentId ? doc.get(root.parentId) : undefined;
    const up = parent ? dataCopyTag(parent) : null;
    if (
      !parent ||
      !isDesignNode(parent) ||
      seen.has(parent.id) ||
      up?.iterator !== tag.iterator ||
      up.key !== tag.key
    ) {
      throw new Error(`"${copyId}" isn't inside one of its iterator's copies.`);
    }
    root = parent;
  }
  const frame = doc.get(tag.iterator);
  const repeat = frame ? repeatOf(frame) : null;
  if (!frame || !repeat) throw new Error(`"${copyId}": its iterator no longer repeats.`);
  // A copy inside another copy is the outer iterator's to write: detaching it alone wouldn't last.
  const seenUp = new Set<string>();
  for (let at: CanvasElement | undefined = frame; at && !seenUp.has(at.id);) {
    seenUp.add(at.id);
    if (dataCopyTag(at)) {
      throw new Error(
        `"${root.name}": this copy is inside another copy. Detach the outer copy first.`,
      );
    }
    const parentId = doc.field(at.id, "parentId");
    at = typeof parentId === "string" ? doc.get(parentId) : undefined;
  }

  const patches = new Map<string, ElementPatch>();
  for (const layer of [root, ...descendants(doc, root.id)]) {
    const patch = freedPatch(layer);
    if (patch) patches.set(layer.id, patch);
  }
  const stored = (frame as unknown as Record<string, unknown>).repeat as Record<string, unknown>;
  const detached = repeat.detached.includes(tag.key)
    ? repeat.detached
    : [...repeat.detached, tag.key];
  doc.checkpoint();
  doc.batch(() => {
    doc.update(frame.id, { repeat: { ...stored, detached } } as ElementPatch);
    if (patches.size > 0) doc.updateMany(patches);
  });
}

/**
 * The detached keys of an iterator whose rows are gone from its list (every row counted, as an
 * export makes them), for checks. None while its source can't be read here.
 */
export function detachedRowsGone(doc: CanvasDocument, frameId: string): string[] {
  const frame = doc.get(frameId);
  const repeat = frame ? repeatOf(frame) : null;
  if (!repeat || repeat.detached.length === 0) return [];
  const scope = scopeAt(doc, frameId);
  if (readsUnreadable(scope, repeat.source)) return [];
  const keys = new Set(repeatRows(repeat, scope, "export").rows.map((row) => row.key));
  return repeat.detached.filter((key) => !keys.has(key));
}
