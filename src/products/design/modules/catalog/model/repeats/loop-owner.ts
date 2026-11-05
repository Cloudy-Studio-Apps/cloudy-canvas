import type { CanvasDocument } from "@canvas";

import type { BrochureElement } from "../../brochure";
import { isFrame } from "../../../frame";
import type { LoopOwner } from "./loop-owner.types";

/**
 * The repeating section or page `owner` names in `record` (a `ScopeLayer.owner`, a copy segment's
 * owner), with the name the In scope view and the canvas show for it: the section's, or the
 * page's printed frame's. `null` when it's neither or doesn't repeat.
 */
export function loopOwner(
  doc: CanvasDocument,
  record: BrochureElement,
  owner: string,
): LoopOwner | null {
  const section = record.sections.find((item) => item.id === owner);
  if (section) {
    return section.repeat
      ? { target: { section: section.id }, name: section.name, repeat: section.repeat }
      : null;
  }
  const slot = record.slots.find((item) => item.id === owner);
  if (!slot?.repeat) return null;
  const frame = doc.get(slot.chosen);
  return { target: { slot: slot.id }, name: isFrame(frame) ? frame.name : "", repeat: slot.repeat };
}
