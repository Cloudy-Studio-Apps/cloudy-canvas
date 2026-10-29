import type { ModuleHost } from "@shared/core";
import { boardCanvas } from "../../board-points";
import { t } from "./core.i18n";

/** The core module's canvas side: what draws and edits its elements, without the editor UI. */
export function registerCoreCanvas(host: ModuleHost): void {
  host.contribute(boardCanvas.keybindings, { "tool.scale": [{ key: "k", shift: true }] });
  host.contribute(boardCanvas.hostCommands, {
    id: "toggleUi",
    label: t("hideUi"),
    keys: [{ code: "Backslash", mod: true, label: "\\" }],
  });
}
