import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { htmlExportFormat } from "./ui/export";
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
  register(host) {
    host.contribute(boardEditor.exportFormats, htmlExportFormat);
  },
});
