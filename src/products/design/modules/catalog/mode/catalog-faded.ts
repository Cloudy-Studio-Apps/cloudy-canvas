import type { ModeFadeContext } from "@canvas";

import { withDescendants } from "../../core";
import { brochuresOf, framesOfMaster } from "../model";
import { CATALOG_PICK_TOOL } from "./catalog-mode.constants";

/**
 * What the Catalog mode dims: everything but the printed pages and the masters of the page's open
 * brochure and what they hold (everything when the page has no brochure); nothing while frames are being
 * picked, so every frame can be judged.
 */
export function catalogFaded({ elements, doc, tool, scope }: ModeFadeContext): string[] {
  if (tool === CATALOG_PICK_TOOL) return [];
  const brochure = brochuresOf(doc).current(scope);
  const printed = new Set(brochure ? brochure.pages().map((page) => page.frame.id) : []);
  // Its masters show too: they're designed alongside the pages.
  for (const master of brochure?.masters.list() ?? []) {
    for (const frame of framesOfMaster(master)) printed.add(frame);
  }
  const shown = withDescendants(printed, elements);
  return elements.filter((el) => !shown.has(el.id)).map((el) => el.id);
}
