import { Database } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardMcpTools } from "../../board-points";
import { boardStarters } from "../core/ui";
import { dbTools } from "./db.mcp";
import { DbOptions } from "./ui/db-options";
import { DbPanel } from "./ui/db-panel";
import { SchemaButton } from "./ui/schema-button";
import { databaseSchemaStarter } from "./ui/starters/database-schema.starter";
import * as dbApi from ".";
import * as dbUi from "./ui";
import { registerDbCanvas } from "./db.canvas";

/**
 * Database schemas: tables and enums, the relation lines between them, the Database tool (D), the
 * schema panel (with its top-bar button) and the DBML agent tools. DBML sticky notes are stickies.
 */
export const dbModule = defineModule({
  id: "db",
  tier: "feature",
  requires: ["sticky"],
  exports: { ...dbApi, ...dbUi },
  register(host) {
    registerDbCanvas(host);
    host.contribute(boardStarters, databaseSchemaStarter);

    host.contribute(boardMcpTools, { id: "db", tools: () => dbTools });

    host.contribute(boardEditor.tools, {
      tool: "db",
      element: "db-table",
      icon: Database,
      toolbar: { group: 1, order: 90 },
      library: { keywords: ["dbml", "schema", "sql"] },
    });
    host.contribute(boardEditor.toolPanels, { tool: "db", component: DbOptions });
    host.contribute(boardEditor.sidePanels, { id: "db.panel", order: 10, component: DbPanel });
    host.contribute(boardEditor.topBar, { id: "db.schema", order: 20, component: SchemaButton });
  },
});
