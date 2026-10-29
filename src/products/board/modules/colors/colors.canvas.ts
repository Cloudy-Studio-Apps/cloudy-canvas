import type { ModuleHost } from "@shared/core";
import { syncTokens } from "@canvas";
import { BOARD_TOKEN_CONTEXT } from "../../tokens";
import { boardCanvas } from "../../board-points";

/** The colors module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerColorsCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.afterEdit, (doc, change, kinds) =>
    syncTokens(doc, change, kinds, BOARD_TOKEN_CONTEXT),
  );
}
