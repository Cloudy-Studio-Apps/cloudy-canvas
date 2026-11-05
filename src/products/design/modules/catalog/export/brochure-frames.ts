import type { BrochureElement } from "../brochure";

/** The frames a brochure prints from: each page's chosen frame and its masters' frames. */
export function brochureFrames(record: BrochureElement): string[] {
  const frames = new Set<string>();
  for (const slot of record.slots) frames.add(slot.chosen);
  for (const master of record.masters) {
    if (master.left) frames.add(master.left);
    if (master.right) frames.add(master.right);
  }
  return [...frames];
}
