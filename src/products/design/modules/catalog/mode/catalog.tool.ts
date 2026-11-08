import { SelectTool, type ResizeMode, type ToolContext } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import { DESIGN_BROCHURES, UnreadableCopyError } from "../model";
import { CATALOG_TOOL } from "./catalog-mode.constants";

/**
 * The Catalog mode's tool: selects pages (click, Shift, marquee) without moving or resizing them.
 * Delete takes the selected frames out of the brochure; they stay in the design (Shift+Delete
 * deletes them, `deleteSelectedPages`), and a page a repeat made is detached from its repeat
 * instead (`DesignBrochure.removeFrames`). Double-click and
 * Enter edit a page in the design (`editCatalogPage`). Works on the page's open brochure.
 */
export class CatalogTool extends SelectTool {
  override readonly id = CATALOG_TOOL;
  override readonly resizeMode: ResizeMode = "none";
  override readonly movesSelection = false;
  /** A page's background picks the page. */
  override readonly boxesOnBackground = false;

  constructor(private readonly context: ToolContext<DesignToolOptions>) {
    super(context);
  }

  onCommand(command: string): boolean {
    if (command !== "deleteSelection") return false;
    const brochures = this.context.service(DESIGN_BROCHURES);
    try {
      brochures.current(this.context.getScope())?.removeFrames(this.context.getSelection());
    } catch (error) {
      if (!(error instanceof UnreadableCopyError)) throw error;
      brochures.refused(error);
    }
    return true;
  }
}
