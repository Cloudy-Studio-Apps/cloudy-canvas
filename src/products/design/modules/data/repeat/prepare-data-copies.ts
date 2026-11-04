import type { CanvasElement, CopyContext } from "@canvas";

import { freedPatch } from "./freed-patch";
import { dataCopyTag } from "./repeat-fields";

/**
 * Copies of an iterator's copies (`prepareCopies`): copied with their iterator frame they're left
 * out (the pasted frame's sync makes its own, and a copy of a copy goes with the copy); copied
 * without it they become ordinary layers, untagged, unlocked and without their data fields, as
 * they look. A copied iterator frame needs nothing here: the copy's ids are remapped, so its
 * `repeat.template` already names the pasted template, and its `detached` stays: the detached
 * copies are plain layers that were pasted with it, and their rows must not be made again.
 */
export function prepareDataCopies(
  copies: CanvasElement[],
  { copied }: CopyContext,
): CanvasElement[] {
  const out: CanvasElement[] = [];
  for (const el of copies) {
    const tag = dataCopyTag(el);
    if (!tag) out.push(el);
    else if (!copied.has(tag.iterator)) out.push({ ...el, ...freedPatch(el) } as CanvasElement);
  }
  return out;
}
