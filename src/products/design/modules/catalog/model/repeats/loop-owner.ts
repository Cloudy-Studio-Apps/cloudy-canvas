import type { CanvasDocument } from "@canvas";

import type { BrochureElement } from "../../brochure";
import { isFrame } from "../../../frame";
import type { LoopOwner, LoopPlace } from "./loop-owner.types";

/**
 * The name of section `owner` as page `at.page` reads it: the expanded section of that loop
 * holding the page (a copy's own name, `copyName`), else the template's (its tokens read at its
 * preview row); `null` when the expansion doesn't place it.
 */
function sectionName(owner: string, at: LoopPlace): string | null {
  const { sections } = at.expansion;
  const holding = sections.find(
    (item) => item.from === owner && item.first <= at.page && at.page < item.end,
  );
  return (holding ?? sections.find((item) => item.id === owner))?.name ?? null;
}

/**
 * The repeating section or page `owner` names in `record` (a `ScopeLayer.owner`, a copy segment's
 * owner), with the name the In scope view and the canvas show for it, as the page at `at` reads
 * it: a section's name with its tokens read (never `{product.name}`), a page's printed frame's.
 * `null` when it's neither or doesn't repeat.
 */
export function loopOwner(
  doc: CanvasDocument,
  record: BrochureElement,
  owner: string,
  at: LoopPlace,
): LoopOwner | null {
  const section = record.sections.find((item) => item.id === owner);
  if (section) {
    if (!section.repeat) return null;
    const name = sectionName(owner, at) ?? section.name;
    return { target: { section: section.id }, name, repeat: section.repeat };
  }
  const slot = record.slots.find((item) => item.id === owner);
  if (!slot?.repeat) return null;
  const frame = doc.get(slot.chosen);
  return { target: { slot: slot.id }, name: isFrame(frame) ? frame.name : "", repeat: slot.repeat };
}
