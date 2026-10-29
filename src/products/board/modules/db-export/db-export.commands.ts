import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { t } from "./db-export.i18n";

/** Opens Export code for the selected tables and enums, or the whole schema. */
export const EXPORT_CODE_COMMAND = "db.exportCode";

/** The Export code host command (the context menu's). */
export function registerDbExportCommands(host: ModuleHost): void {
  host.contribute(boardCanvas.hostCommands, {
    id: EXPORT_CODE_COMMAND,
    label: t("commands.exportCode"),
  });
}
