import type { TextNodeElement } from "../../../text";
import { alignedTextPatch } from "../../../text";

/**
 * What a page item's text becomes when it reads `text`: its new size (an auto-sized text keeps
 * its alignment's edge where it was: a right-aligned page number grows to the left), its styled
 * ranges dropped (they named the template's characters). `null` when it already reads that.
 */
export function itemTextPatch(el: TextNodeElement, text: string): Partial<TextNodeElement> | null {
  if (el.text === text) return null;
  return alignedTextPatch(el, text, []);
}
