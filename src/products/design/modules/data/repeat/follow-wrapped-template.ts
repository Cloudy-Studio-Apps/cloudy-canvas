import type { CanvasDocument, EditedChange, ElementPatch } from "@canvas";

import { ancestorChain } from "./ancestor-chain";
import { descendants } from "./descendants";
import { dataCopyTag, repeatOf } from "./repeat-fields";

/**
 * After an edit, in its undo step and before the sync reads the repeats: a frame's card wrapped
 * in place (grouped, framed or given an auto layout in that edit) makes the wrapper its card.
 * When the card the repeat names left the frame's children in this edit and now sits inside a
 * child of the frame the same edit added (no fields before it), that child becomes
 * `repeat.template`; the sync then replaces the old card's copies with the wrapper's. A wrapper
 * that is itself a copy, or holds one of the frame's copies (the card grouped with its copies),
 * isn't a wrap in place, and neither is a child that was already there: the repeat ends as it
 * does when the card leaves (a missing card never makes another layer the card). A copied
 * iterator's repeat is its template's to say.
 */
export function followWrappedTemplate(doc: CanvasDocument, change: EditedChange): void {
  for (const [id, before] of change.before) {
    if (!("parentId" in before) || typeof before.parentId !== "string") continue;
    const frameId = before.parentId;
    const frame = doc.get(frameId);
    const repeat = frame ? repeatOf(frame) : null;
    if (!frame || !repeat || repeat.template !== id || dataCopyTag(frame)) continue;
    const card = doc.get(id);
    if (!card || doc.field(id, "parentId") === frameId) continue;
    // The frame's child the card now sits in, if it's still inside the frame.
    const chain = ancestorChain(doc, card);
    const at = chain.findIndex((el) => el.id === frameId);
    const wrapper = at > 0 ? chain[at - 1] : undefined;
    if (!wrapper || !change.updated.has(wrapper.id) || change.before.has(wrapper.id)) continue;
    if (dataCopyTag(wrapper)) continue;
    const inside = descendants(doc, wrapper.id);
    if (inside.some((el) => dataCopyTag(el)?.iterator === frameId)) continue;
    const stored = (frame as unknown as Record<string, unknown>).repeat as Record<string, unknown>;
    doc.update(frameId, { repeat: { ...stored, template: wrapper.id } } as ElementPatch);
  }
}
