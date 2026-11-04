import type { CanvasElement, CopyContext } from "@canvas";

import { freedPatch } from "./freed-patch";
import { freePastedRowNames } from "./free-pasted-row-names";
import { dataCopyTag } from "./repeat-fields";

/**
 * Copies of an iterator's copies (`prepareCopies`): copied with their iterator frame they're left
 * out (the pasted frame's sync makes its own); copied without it they become ordinary layers,
 * untagged, unlocked and without their data fields, as they look, and so does everything inside
 * them, a copied iterator's own copies included. A copied iterator frame keeps its repeat: ids
 * are remapped, so its `repeat.template` already names the pasted template, and its `detached`
 * stays: the detached copies are plain layers pasted with it, and their rows must not be made again.
 * Its row name changes only when it would hide a source or an outer row name where it lands
 * (`freePastedRowNames`).
 */
export function prepareDataCopies(
  copies: CanvasElement[],
  { copied, existing }: CopyContext,
): CanvasElement[] {
  const byId = new Map(copies.map((el) => [el.id, el]));
  const memo = new Map<string, boolean>();
  // Freed: its iterator isn't copied, or is itself a copy that is freed (the whole copy was copied).
  const freed = (el: CanvasElement): boolean => {
    const known = memo.get(el.id);
    if (known !== undefined) return known;
    memo.set(el.id, false);
    const tag = dataCopyTag(el);
    const owner = tag ? byId.get(tag.iterator) : undefined;
    const result =
      !!tag && (!copied.has(tag.iterator) || (!!owner && !!dataCopyTag(owner) && freed(owner)));
    memo.set(el.id, result);
    return result;
  };
  const out: CanvasElement[] = [];
  for (const el of copies) {
    if (!dataCopyTag(el)) out.push(el);
    else if (freed(el)) out.push({ ...el, ...freedPatch(el) } as CanvasElement);
  }
  return freePastedRowNames(out, existing);
}
