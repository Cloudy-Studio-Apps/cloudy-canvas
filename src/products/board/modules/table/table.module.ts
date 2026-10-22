import { Table } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { TABLE_COLORS } from "../../palette";
import { TableKind } from "./table.kind";
import { TableTool } from "./table.tool";
import { TableOptions } from "./ui/table-options";

/** Tables: the kind, the tool (G) and its panel (header, tint, cell fills, rows and columns). */
export const tableModule = defineModule({
  id: "table",
  register(host) {
    host.contribute(boardCanvas.kinds, new TableKind());
    host.contribute(boardCanvas.tools, {
      id: "table",
      create: (ctx) => new TableTool(ctx),
      keys: [{ key: "g" }],
    });
    host.contribute(boardCanvas.options, {
      tableColor: TABLE_COLORS[0].value,
      tableHeader: true,
    });

    host.contribute(boardEditor.tools, {
      tool: "table",
      element: "table",
      icon: Table,
      toolbar: { group: 1, order: 80 },
    });
    host.contribute(boardEditor.toolPanels, { tool: "table", component: TableOptions });
    host.contribute(boardEditor.selectionPanels, { type: "table", component: TableOptions });
  },
});
