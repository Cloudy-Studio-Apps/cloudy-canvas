import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { TABLE_COLORS } from "../../palette";
import { TableKind } from "./table.kind";
import { TableTool } from "./table.tool";

/** The table module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerTableCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.kinds, new TableKind());
  host.contribute(boardCanvas.tools, {
    id: "table",
    create: (ctx) => new TableTool(ctx),
    keys: [{ key: "g" }],
  });
  host.contribute(boardCanvas.options, {
    tableColor: TABLE_COLORS[0].value,
    tableColorToken: null,
    tableHeader: true,
  });
}
