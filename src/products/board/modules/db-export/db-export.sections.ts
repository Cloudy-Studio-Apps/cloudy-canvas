import type { ModuleHost } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { isDbEnum, isDbTable } from "../db";
import { dbPanelActions } from "../db/ui";
import { EXPORT_CODE_COMMAND } from "./db-export.commands";
import { CodeExportDialog, ExportCodeButton, useExportCodeCommand } from "./ui";
import { t } from "./db-export.i18n";

/** The Export code dialog, its command, the context menu item and the database panel button. */
export function registerDbExportSections(host: ModuleHost): void {
  host.contribute(boardEditor.overlays, { id: "db-export.dialog", component: CodeExportDialog });
  host.contribute(boardEditor.sessionHooks, { id: "db-export.command", use: useExportCodeCommand });
  host.contribute(boardEditor.contextMenu, {
    id: "db-export",
    menu: "selection",
    items: [
      {
        command: EXPORT_CODE_COMMAND,
        label: t("menu.exportCode"),
        enabled: (_context, engine) =>
          engine.selectedIds().some((id) => {
            const el = engine.getElement(id);
            return isDbTable(el) || isDbEnum(el);
          }),
      },
    ],
  });
  host.contribute(dbPanelActions, {
    id: "db-export.button",
    order: 10,
    component: ExportCodeButton,
  });
}
