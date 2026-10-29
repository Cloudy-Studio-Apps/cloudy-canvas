import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { STICKY_COLORS } from "../../palette";
import { StickyKind } from "./sticky.kind";
import { StickyTool } from "./sticky.tool";

/** The sticky module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerStickyCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new StickyKind());
  host.contribute(boardCanvas.tools, {
    id: "sticky",
    create: (ctx) => new StickyTool(ctx),
    keys: [{ key: "s" }],
  });
  host.contribute(boardCanvas.options, {
    stickyColor: STICKY_COLORS[0].value,
    stickyColorToken: null,
  });
}
