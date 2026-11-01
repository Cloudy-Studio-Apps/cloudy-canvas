import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { t } from "./er.i18n";

/** Opens "Create tables" for the selected ER shape's diagram. */
export const CREATE_TABLES_COMMAND = "er.createTables";

/** Opens the Mermaid dialog for the selected ER shape's diagram. */
export const EXPORT_MERMAID_COMMAND = "er.exportMermaid";

/** Turns the selected relation into an entity with a two-way relation per side. */
export const CONVERT_TO_ENTITY_COMMAND = "er.convertToEntity";

/** The host commands of ER to tables, Mermaid and converting a relation (the context menu's). */
export function registerErCommands(host: ModuleHost): void {
  host.contribute(
    boardCanvas.hostCommands,
    { id: CREATE_TABLES_COMMAND, label: t("commands.createTables") },
    { id: EXPORT_MERMAID_COMMAND, label: t("commands.exportMermaid") },
    { id: CONVERT_TO_ENTITY_COMMAND, label: t("commands.convertToEntity") },
  );
}
