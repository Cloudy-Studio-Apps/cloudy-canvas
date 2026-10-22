import type { ElementPatch } from "@canvas";

import { textSize } from "./text-layout";
import type { TextNodeElement } from "./text.types";

/** A change to a text's typography or layout, with the size its text then takes. */
export function retypeset(
  el: TextNodeElement,
  change: Partial<TextNodeElement>,
): ElementPatch<TextNodeElement> {
  return { ...change, ...textSize({ ...el, ...change }) };
}
