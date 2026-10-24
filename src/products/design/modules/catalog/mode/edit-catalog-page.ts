import { DEFAULT_MODE, type CanvasElement, type ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { isPageFrame } from "../model";
import { CATALOG_MODE_ID } from "./catalog-mode.constants";

/**
 * The catalog module's `editElement`: double-clicking (or Enter on) a page in the Catalog mode
 * goes back to designing, with the page selected.
 */
export function editCatalogPage(el: CanvasElement, ctx: ToolContext<DesignToolOptions>): boolean {
  if (ctx.getMode() !== CATALOG_MODE_ID || !isPageFrame(el)) return false;
  ctx.setMode(DEFAULT_MODE.id);
  ctx.setSelection([el.id]);
  return true;
}
