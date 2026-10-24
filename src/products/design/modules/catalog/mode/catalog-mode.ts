import type { CanvasMode } from "@canvas";

import { isPageFrame } from "../model";
import { CATALOG_ALLOWED_COMMANDS } from "./catalog-allowed-commands";
import { catalogFaded } from "./catalog-faded";
import { CATALOG_MODE_ID, CATALOG_PICK_TOOL, CATALOG_TOOL } from "./catalog-mode.constants";

/**
 * The Catalog mode: a design's frames as a brochure's pages. Only top-level frames can be pointed
 * at (a click inside one reaches the frame); what isn't printed is dimmed; the select-only tool,
 * the hand and the pick tool work, and only the commands that organize (`CATALOG_ALLOWED_COMMANDS`)
 * run. The editor shows the brochure's tab, sidebar, page badges and toolbar while it's on.
 */
export const CATALOG_MODE: CanvasMode = {
  id: CATALOG_MODE_ID,
  tool: CATALOG_TOOL,
  tools: ["hand", CATALOG_PICK_TOOL],
  isolate: isPageFrame,
  faded: catalogFaded,
  commands: CATALOG_ALLOWED_COMMANDS,
};
