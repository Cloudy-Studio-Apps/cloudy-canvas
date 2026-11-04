import {
  compareByIndex,
  type CanvasDocument,
  type CanvasElement,
  type ElementPatch,
} from "@canvas";

import { isFrame } from "../../frame";
import { isDesignNode, type DesignNode } from "../../core";
import { childrenMap, walkDescendants } from "./descendants";
import { dataCopyTag, repeatOf } from "./repeat-fields";
import { templateOf } from "./template-of";

/**
 * After a deletion, in its undo step (an `onRemove`): a removed template takes its iterator's
 * copies (the repeat goes too when the frame has no layer left), and a removed iterator takes
 * the copies that weren't removed with it (dragged out of it). `before` is the scene as it was,
 * which says what the frame repeated and held.
 */
export function pruneData(
  doc: CanvasDocument,
  removed: ReadonlySet<string>,
  before: readonly CanvasElement[],
): void {
  const gone = new Set<string>();
  const emptied: string[] = [];
  const kids = new Map<string, DesignNode[]>();
  for (const el of before) {
    if (!isDesignNode(el) || !el.parentId) continue;
    const list = kids.get(el.parentId);
    if (list) list.push(el);
    else kids.set(el.parentId, [el]);
  }
  for (const el of before) {
    if (!removed.has(el.id)) continue;
    // An iterator removed: every copy it made goes, wherever it is.
    if (repeatOf(el)) gone.add(el.id);
    const frame = isDesignNode(el) && el.parentId ? doc.get(el.parentId) : undefined;
    const repeat = frame ? repeatOf(frame) : null;
    if (!frame || !repeat || removed.has(frame.id) || dataCopyTag(el)) continue;
    // A layer of a frame that repeats: was it the template?
    const children = (kids.get(frame.id) ?? []).sort(compareByIndex);
    const template = isFrame(frame) ? templateOf(frame, children) : null;
    if (template?.id !== el.id) continue;
    gone.add(frame.id);
    if (
      children.every((child) => removed.has(child.id) || dataCopyTag(child)?.iterator === frame.id)
    ) {
      emptied.push(frame.id);
    }
  }
  if (gone.size === 0) return;
  const roots = doc
    .all()
    .filter((el) => !removed.has(el.id) && gone.has(dataCopyTag(el)?.iterator ?? ""))
    .map((el) => el.id);
  // What a copy holds goes with it, such as a copied iterator's own copies.
  const copies = new Set(roots);
  for (const inner of walkDescendants(childrenMap(doc), roots)) {
    if (!removed.has(inner.id)) copies.add(inner.id);
  }
  if (copies.size > 0) doc.remove([...copies]);
  for (const id of emptied) doc.update(id, { repeat: null } as ElementPatch);
}
