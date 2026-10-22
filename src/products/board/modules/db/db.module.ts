import { Database } from "lucide-react";

import { defineModule } from "@shared/core";
import { toolItem } from "@board/ui/components/library/library-catalog";
import { boardLibrary } from "@board/ui/components/library/library-points";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardAgentTools, boardCanvas } from "../../board-points";
import { dbTools } from "./db.agent-tools";
import { DbTool } from "./db.tool";
import { DbEnumKind } from "./enum";
import { DbLinks } from "./links";
import { prepareDbCopies, pruneRefs } from "./schema";
import { DbTableKind } from "./table";
import { DbOptions } from "./ui/db-options";
import { DbPanel } from "./ui/db-panel";
import { SchemaButton } from "./ui/schema-button";

/**
 * Database schemas: tables and enums, the relation lines between them, the Database tool (D), the
 * schema panel (with its top-bar button) and the DBML agent tools. DBML sticky notes are stickies.
 */
export const dbModule = defineModule({
  id: "db",
  requires: ["sticky"],
  register(host) {
    const table = new DbTableKind();
    host.contribute(boardCanvas.kinds, table, new DbEnumKind());
    host.contribute(boardCanvas.tools, {
      id: "db",
      create: (ctx) => new DbTool(ctx),
      keys: [{ key: "d" }],
    });
    host.contribute(boardCanvas.options, { dbKind: "table" });
    host.contribute(boardCanvas.links, () => new DbLinks());
    // Relations pointing at deleted tables or columns go with them.
    host.contribute(boardCanvas.onRemove, (doc) => pruneRefs(doc));
    // Copies get free table and enum names.
    host.contribute(boardCanvas.prepareCopies, prepareDbCopies);
    host.contribute(boardAgentTools, { id: "db", tools: () => dbTools });

    host.contribute(boardEditor.toolbar, {
      tool: "db",
      element: "db-table",
      icon: Database,
      group: 1,
      order: 90,
    });
    host.contribute(boardEditor.toolPanels, { tool: "db", component: DbOptions });
    host.contribute(boardEditor.sidePanels, { id: "db.panel", order: 10, component: DbPanel });
    host.contribute(boardEditor.topBar, { id: "db.schema", order: 20, component: SchemaButton });
    host.contribute(
      boardLibrary.items,
      toolItem("db", table, Database, 30, ["dbml", "schema", "sql"]),
    );
  },
});
