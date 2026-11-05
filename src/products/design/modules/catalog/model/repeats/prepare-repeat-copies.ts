import type { CanvasElement } from "@canvas";

import { freedPatch } from "../../../data";
import { repeatCopyTag } from "./repeat-copy-tag";

/**
 * Copies of a generated page's layers (`prepareCopies`): pasted, a page or part of one is no
 * longer a repeat's copy (no slot lists it, and nothing around it gives its rows), so it becomes
 * an ordinary layer as it looks: untagged, unlocked and without its data fields (`freedPatch`).
 */
export function prepareRepeatCopies(copies: CanvasElement[]): CanvasElement[] {
  return copies.map((el) =>
    repeatCopyTag(el) ? ({ ...el, ...freedPatch(el), repeatCopy: null } as CanvasElement) : el,
  );
}
