import type { CanvasElement, CopyContext } from "@canvas";

import { generatedMark } from "./is-sheet";

/**
 * Copies of generated layers made without their live element (`prepareCopies`) become ordinary
 * layers: unmarked and unlocked, keeping their variable links. Copied with their element, they
 * stay its (their `generated.sheet` already points at the element's copy).
 */
export function prepareSheetCopies(
  copies: CanvasElement[],
  { copied }: CopyContext,
): CanvasElement[] {
  return copies.map((el) => {
    const mark = generatedMark(el);
    if (!mark || copied.has(mark.sheet)) return el;
    return { ...el, generated: null, locked: false } as CanvasElement;
  });
}
