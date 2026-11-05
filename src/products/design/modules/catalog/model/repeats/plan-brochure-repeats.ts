import type { CanvasDocument, Point, Rect } from "@canvas";
import { createId } from "@shared/core";

import type { DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";
import type { BrochureElement, BrochureSlot } from "../../brochure";
import { ARRANGE_GAPS } from "../arrange/arrange.constants";
import { isPageFrame } from "../page-frame";
import { copyPathKey, segmentOwner } from "./copy-segment";
import { copyShelf } from "./copy-shelf";
import { brochureCopies } from "./brochure-copies";
import { orphanLayers } from "./orphan-layers";
import { planPageCopy } from "./plan-page-copy";
import { repeatCopyTag } from "./repeat-copy-tag";
import { slotKey } from "./slot-key";
import type { BrochureExpansion } from "./expand-brochure.types";
import type { BrochureRepeatsPlan } from "./plan-brochure-repeats.types";

/** A frame and everything it holds, the frame first. */
function treeOf(root: DesignNode, children: ReadonlyMap<string, readonly DesignNode[]>) {
  const out: DesignNode[] = [root];
  for (let i = 0; i < out.length; i++) out.push(...(children.get((out[i] as DesignNode).id) ?? []));
  return out;
}

/**
 * What a brochure's generated pages need so they match its expansion: each copy made that prints
 * gets a page (`planPageCopy` of its template slot's printed frame; a new one placed after the page
 * before it, which arranging then moves, or on a row below every layer of the design page when
 * the brochure isn't arranged, `copyShelf`), listed as a slot with `generated` (its template slot's master and detached master
 * layers too), the slots in the expansion's order. A copy is found by its slot, else by its tag
 * (template frame and copy path; the first in sibling order wins), so two clients that made the
 * same copy end with one. A copy no longer made goes, frame and slot, and so does any copy frame
 * no slot lists (`orphanLayers`), but a copy of a list this device can't read stays as it is,
 * after the slot before it. Pure: it only reads the document (`children`: every layer's children
 * by parent).
 */
export function planBrochureRepeats(
  doc: CanvasDocument,
  record: BrochureElement,
  expansion: BrochureExpansion,
  children: ReadonlyMap<string, readonly DesignNode[]>,
): BrochureRepeatsPlan {
  const plan: BrochureRepeatsPlan = { pages: [], slots: null, remove: [] };
  const byKey = new Map<string, BrochureSlot>();
  for (const slot of record.slots) if (!byKey.has(slotKey(slot))) byKey.set(slotKey(slot), slot);
  const unreadable = new Set(
    expansion.pages
      .filter((page) => page.layers.some((layer) => layer.unreadable))
      .map((page) => page.from),
  );
  const frameOf = (id: string) => {
    const el = doc.get(id);
    return isPageFrame(el) && el.pageId === record.page ? el : null;
  };
  // Every copy made, listed or not: a copy is found by its slot, else by its tag, the first wins.
  const copies = brochureCopies(doc, record);
  const byTag = new Map<string, FrameElement>();
  for (const copy of copies) {
    const tag = repeatCopyTag(copy);
    const key = tag ? `${tag.source}|${tag.key}` : "";
    if (tag && !byTag.has(key)) byTag.set(key, copy);
  }
  const taken = new Set<string>();

  const slots: BrochureSlot[] = [];
  const kept = new Set<string>();
  let before: Rect | null = null;
  // Not arranged: new copies go on a row below everything, never over what's there.
  const arranged = record.settings.arrange !== "off";
  let shelf: ((w: number) => Point) | null = null;
  for (const page of expansion.pages) {
    const own = byKey.get(page.id);
    if (page.path.length === 0) {
      if (!own || own.generated) continue;
      slots.push(own);
      kept.add(own.id);
      const frame = frameOf(own.chosen);
      if (frame) before = frame;
      continue;
    }
    if (!page.made || !page.printed) continue;
    const template = byKey.get(page.from);
    const frame = template && !template.generated ? frameOf(template.chosen) : null;
    if (!template || !frame) continue;
    const old = own ? frameOf(own.chosen) : null;
    const listed = old && repeatCopyTag(old)?.brochure === record.id ? old : null;
    const tagged = byTag.get(`${frame.id}|${copyPathKey(page.path)}`) ?? null;
    const copy =
      listed && !taken.has(listed.id) ? listed : tagged && !taken.has(tagged.id) ? tagged : null;
    if (copy) taken.add(copy.id);
    const at =
      !copy && !arranged
        ? (shelf ??= copyShelf(doc, record.page, frame.x))(frame.w)
        : before
          ? { x: before.x + before.w + ARRANGE_GAPS.spread, y: before.y }
          : { x: frame.x, y: frame.y + frame.h + ARRANGE_GAPS.spread };
    const copyPlan = planPageCopy({
      template: frame,
      tree: treeOf(frame, children),
      copy,
      existing: copy ? treeOf(copy, children).slice(1) : [],
      tag: {
        brochure: record.id,
        iterator: segmentOwner(page.path[page.path.length - 1] ?? ""),
        key: copyPathKey(page.path),
      },
      at,
    });
    plan.pages.push(copyPlan);
    const slot: BrochureSlot = {
      id: own?.id ?? createId(),
      frames: [copyPlan.rootId],
      chosen: copyPlan.rootId,
      ...(template.master !== undefined ? { master: template.master } : {}),
      ...(template.skip ? { skip: template.skip } : {}),
      generated: { from: page.from, path: [...page.path] },
    };
    slots.push(slot);
    kept.add(slot.id);
    before = copy ?? { ...at, w: frame.w, h: frame.h };
  }

  record.slots.forEach((slot, i) => {
    if (kept.has(slot.id)) return;
    if (slot.generated && !unreadable.has(slot.generated.from)) return;
    // A copy of a list this device can't read stays, after the slot before it (and so would a
    // page the expansion missed).
    kept.add(slot.id);
    let at = 0;
    for (let j = i - 1; j >= 0 && at === 0; j--) {
      const previous = record.slots[j]?.id;
      at = slots.findIndex((item) => item.id === previous) + 1;
    }
    slots.splice(at, 0, slot);
  });
  plan.remove = orphanLayers(record, copies, slots, unreadable, children);
  if (JSON.stringify(slots) !== JSON.stringify(record.slots)) plan.slots = slots;
  return plan;
}
