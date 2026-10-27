import type { ModuleHost } from "@shared/core";
import { designCanvas } from "../../design-points";
import { t } from "./core.i18n";

/** The core's host commands (flip, rulers and guides, panels, Hide UI) and the scale tool's key. */
export function registerCoreCommands(host: ModuleHost): void {
  host.contribute(
    designCanvas.hostCommands,
    {
      id: "flipHorizontal",
      label: t("commands.flipHorizontal"),
      keys: [{ key: "h", shift: true }],
    },
    { id: "flipVertical", label: t("commands.flipVertical"), keys: [{ key: "v", shift: true }] },
    { id: "toggleRulers", label: t("commands.rulers"), keys: [{ key: "r", shift: true }] },
    {
      id: "toggleGuides",
      label: t("commands.rulerGuides"),
      keys: [{ code: "Semicolon", shift: true, label: ";" }],
    },
    { id: "clearGuides", label: t("commands.removeGuides") },
    {
      id: "toggleUi",
      label: t("commands.hideUi"),
      keys: [{ code: "Backslash", mod: true, label: "\\" }],
    },
    { id: "toggleLeftPanel", label: t("commands.leftPanel") },
    { id: "toggleRightPanel", label: t("commands.propertiesPanel") },
  );
  host.contribute(designCanvas.keybindings, { "tool.scale": [{ key: "k" }] });
}
