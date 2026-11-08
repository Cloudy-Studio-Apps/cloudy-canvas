import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { t } from "./model3d.i18n";

/** Opens the selected model's live 3D view (the context menu's Edit in 3D). */
export const EDIT_MODEL_COMMAND = "model3d.editLive";

/** Asks to convert the selected model to a PNG image (the context menu's Convert to PNG). */
export const CONVERT_MODEL_COMMAND = "model3d.convert";

/** Picks a model file and places it in the middle of the view. */
export const PLACE_MODEL_COMMAND = "model3d.place";

/** The host commands of the model's context menu items. */
export function registerModel3dCommands(host: ModuleHost): void {
  host.contribute(
    boardCanvas.hostCommands,
    { id: EDIT_MODEL_COMMAND, label: t("commands.edit") },
    { id: CONVERT_MODEL_COMMAND, label: t("commands.convert") },
    { id: PLACE_MODEL_COMMAND, label: t("commands.place") },
  );
}
