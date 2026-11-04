import type { CanvasDocument, ElementPatch } from "@canvas";

import { isDesignNode } from "../../../core";
import { isText } from "../../../text";
import type { BrochureElement } from "../../brochure";
import { framesOfMaster } from "../masters/master-frames";
import { itemTextPatch } from "../page-items/item-text-patch";
import { pageItemTag, pageItemTemplate } from "../page-items/page-item-fields";
import { DOCUMENT_TEXTS, documentTexts } from "./document-texts";

/** Every language's word → the same word in `to`, for what `words` picks out of a language. */
function wordMap(
  to: string,
  words: (texts: ReturnType<typeof documentTexts>) => readonly string[],
): Map<string, string> {
  const target = words(documentTexts(to));
  const map = new Map<string, string>();
  for (const texts of Object.values(DOCUMENT_TEXTS)) {
    words(texts).forEach((word, i) => {
      const next = target[i];
      if (next !== undefined && !map.has(word)) map.set(word, next);
    });
  }
  return map;
}

/**
 * What the brochure's built-in page items and master frames become in language `to`: a "Page 3
 * of 24" template, a built-in's layer name and a master frame's "· left" written in any brochure
 * language are written in `to` (on a master the text shows its template, so it's rewritten too);
 * texts someone wrote or changed are left as they are. Master copies follow their master, and
 * page items on pages are read again, in the same sync. Pure: it only reads.
 */
export function retranslateItems(
  doc: CanvasDocument,
  record: BrochureElement,
  to: string,
): Map<string, ElementPatch> {
  const ids = Object.keys(documentTexts(to).items);
  const names = wordMap(to, (texts) => ids.map((id) => texts.items[id] ?? ""));
  const templates = wordMap(to, (texts) => [texts.pageOf]);
  const sides = wordMap(to, (texts) => [texts.left, texts.right]);
  const masterFrames = new Set(record.masters.flatMap(framesOfMaster));
  const roots = new Set([...masterFrames, ...record.slots.flatMap((slot) => slot.frames)]);
  const patches = new Map<string, ElementPatch>();

  for (const master of record.masters) {
    const prefix = `${master.name} · `;
    for (const frame of framesOfMaster(master)) {
      const el = doc.get(frame);
      if (!el || !isDesignNode(el) || !el.name.startsWith(prefix)) continue;
      const word = el.name.slice(prefix.length);
      const next = sides.get(word);
      if (next !== undefined && next !== word)
        patches.set(el.id, { name: prefix + next } as ElementPatch);
    }
  }

  for (const el of doc.all()) {
    if (!isText(el) || pageItemTag(el)) continue;
    const root = topFrame(doc, el.id);
    if (!roots.has(root)) continue;
    const patch: Record<string, unknown> = {};
    const name = names.get(el.name);
    if (name !== undefined && name !== el.name) patch.name = name;
    const template = pageItemTemplate(el);
    const next = template === null ? undefined : templates.get(template);
    if (next !== undefined && next !== template) {
      patch.catalogText = next;
      // A master shows its template; a page reads it again in the sync.
      if (masterFrames.has(root)) Object.assign(patch, itemTextPatch(el, next));
    }
    if (Object.keys(patch).length > 0) patches.set(el.id, patch as ElementPatch);
  }
  return patches;
}

/** The top-level frame layer `id` is in. */
function topFrame(doc: CanvasDocument, id: string): string {
  let top = id;
  for (let depth = 0; depth < 64; depth++) {
    const parent = doc.field(top, "parentId");
    if (typeof parent !== "string") break;
    top = parent;
  }
  return top;
}
