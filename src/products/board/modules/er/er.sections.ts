import { Network } from "lucide-react";

import type { ModuleHost } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { isErElement } from "./base";
import { CONVERT_TO_ENTITY_COMMAND, CREATE_TABLES_COMMAND } from "./er.commands";
import { canConvert, type ErRelationElement } from "./relation";
import { useConvertCommand } from "./ui/er-convert";
import { ErPanel } from "./ui/er-panel";
import { ErQuickAddMenu } from "./ui/er-quick-add";
import { ErRelationPrompt } from "./ui/er-relation-prompt";
import { ErToTablesDialog, useCreateTablesCommand } from "./ui/er-to-tables";
import { t } from "./er.i18n";

/**
 * The toolbar button, the ER panel, ER to tables, Convert to entity, the quick-add menu and the
 * relation prompt.
 */
export function registerErSections(host: ModuleHost): void {
  // ER to tables: the dialog, its command (context menu) and the panel and toolbar buttons.
  host.contribute(boardEditor.sessionHooks, { id: "er.convert", use: useConvertCommand });
  host.contribute(boardEditor.overlays, { id: "er.toTables", component: ErToTablesDialog });
  host.contribute(boardEditor.sessionHooks, {
    id: "er.createTables",
    use: useCreateTablesCommand,
  });
  host.contribute(boardEditor.contextMenu, {
    id: "er",
    menu: "selection",
    items: [
      {
        command: CONVERT_TO_ENTITY_COMMAND,
        label: t("menu.convertToEntity"),
        enabled: (_context, engine) => {
          const [id, ...others] = engine.selectedIds();
          const el = id && others.length === 0 ? engine.getElement(id) : undefined;
          return el?.type === "er-relation" && canConvert(el as ErRelationElement, engine);
        },
      },
      {
        command: CREATE_TABLES_COMMAND,
        label: t("menu.createTables"),
        enabled: (_context, engine) =>
          engine.selectedIds().some((id) => isErElement(engine.getElement(id))),
      },
    ],
  });
  host.contribute(boardEditor.tools, {
    tool: "er",
    element: "er-entity",
    icon: Network,
    toolbar: { group: 1, order: 100 },
    library: { keywords: ["entity", "relation", "chen"] },
  });
  host.contribute(boardEditor.sidePanels, { id: "er.panel", order: 20, component: ErPanel });
  // What to create where a connect dot was dropped on empty board.
  host.contribute(boardEditor.overlays, { id: "er.quickAdd", component: ErQuickAddMenu });
  // What kind of relation a connect dot dropped on another entity makes.
  host.contribute(boardEditor.overlays, { id: "er.relationPrompt", component: ErRelationPrompt });
}
