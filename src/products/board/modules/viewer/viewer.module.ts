import { defineModule } from "@shared/core";
import * as viewerApi from ".";
import * as viewerUi from "./ui";

/**
 * The board's HTML export: a read-only file that draws the board with the engine, plus what
 * modules add to it through `boardViewerParts` (toggles, code panels, clicks).
 */
export const viewerModule = defineModule({
  id: "viewer",
  tier: "feature",
  exports: { ...viewerApi, ...viewerUi },
  register() {},
});
