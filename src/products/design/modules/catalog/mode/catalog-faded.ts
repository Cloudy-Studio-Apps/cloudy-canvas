import type { ModeFadeContext } from "@canvas";

import { withDescendants } from "../../core";
import { brochureOf, brochurePages } from "../model";
import { CATALOG_PICK_TOOL } from "./catalog-mode.constants";

/**
 * What the Catalog mode dims: everything but the printed pages and what they hold; nothing while
 * frames are being picked, so every frame can be judged.
 */
export function catalogFaded({ elements, doc, tool }: ModeFadeContext): string[] {
  if (tool === CATALOG_PICK_TOOL) return [];
  const brochure = brochureOf(doc);
  const printed = new Set(
    brochure ? brochurePages(doc, brochure).map((page) => page.frame.id) : [],
  );
  const shown = withDescendants(printed, elements);
  return elements.filter((el) => !shown.has(el.id)).map((el) => el.id);
}
