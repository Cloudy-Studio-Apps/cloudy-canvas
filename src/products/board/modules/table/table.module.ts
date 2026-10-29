import { Table } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { TableOptions } from "./ui/table-options";
import * as tableApi from ".";
import { registerTableCanvas } from "./table.canvas";

/** Tables: the kind, the tool (G) and its panel (header, tint, cell fills, rows and columns). */
export const tableModule = defineModule({
  id: "table",
  tier: "feature",
  exports: { ...tableApi },
  register(host) {
    registerTableCanvas(host);

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
