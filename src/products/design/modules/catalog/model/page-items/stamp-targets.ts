import type { CanvasDocument } from "@canvas";

import type { BrochureElement, BrochureSlot } from "../../brochure";
import { isFrame } from "../../../frame";
import type { BookLayout } from "../book-layout.types";
import type { PageInfo } from "../numbering/page-numbers.types";
import type { StampTarget } from "./stamp-targets.types";

/** The master a slot shows on `info`'s side, with its frame there, or `null`. */
function masterFor(
  doc: CanvasDocument,
  record: BrochureElement,
  slot: BrochureSlot,
  info: PageInfo,
): StampTarget["master"] {
  if (info.cover && !record.settings.mastersOnCovers) return null;
  const id = slot.master === undefined ? record.settings.defaultMaster : slot.master;
  const master = id === null ? undefined : record.masters.find((item) => item.id === id);
  if (!master) return null;
  const frameId = info.parity === "left" ? master.left : master.right;
  const frame = frameId === null ? undefined : doc.get(frameId);
  return isFrame(frame) ? { record: master, frame } : null;
}

/**
 * Every page of the brochure as it's stamped: each printed side, on every option frame of its
 * page (so choosing another option shows a finished page), a spread frame's two halves apart.
 * Blank pages the layout adds have no frame, so nothing.
 */
export function stampTargets(
  doc: CanvasDocument,
  record: BrochureElement,
  layout: BookLayout,
  numbers: readonly PageInfo[],
): StampTarget[] {
  const targets: StampTarget[] = [];
  layout.sides.forEach((side, i) => {
    const info = numbers[i];
    if (side.kind !== "page" || !info) return;
    const { slot, options } = side.page;
    const master = masterFor(doc, record, slot, info);
    const skip = new Set(slot.skip ?? []);
    for (const frame of options) {
      const half = side.part === "whole" ? undefined : side.part;
      const offsetX = side.part === "right" ? frame.w / 2 : 0;
      targets.push({ frame, offsetX, ...(half ? { half } : {}), info, master, skip });
    }
  });
  return targets;
}
