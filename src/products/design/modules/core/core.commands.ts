import type { ModuleHost } from "@shared/core";
import { designCanvas } from "../../design-points";

/** The core's host commands (flip, rulers and guides, panels, Hide UI) and the scale tool's key. */
export function registerCoreCommands(host: ModuleHost): void {
  host.contribute(
    designCanvas.hostCommands,
    { id: "flipHorizontal", label: "Flip horizontal", keys: [{ key: "h", shift: true }] },
    { id: "flipVertical", label: "Flip vertical", keys: [{ key: "v", shift: true }] },
    { id: "toggleRulers", label: "Rulers", keys: [{ key: "r", shift: true }] },
    {
      id: "toggleGuides",
      label: "Ruler guides",
      keys: [{ code: "Semicolon", shift: true, label: ";" }],
    },
    { id: "clearGuides", label: "Remove all guides" },
    { id: "toggleUi", label: "Hide UI", keys: [{ code: "Backslash", mod: true, label: "\\" }] },
    { id: "toggleLeftPanel", label: "Left panel" },
    { id: "toggleRightPanel", label: "Properties panel" },
  );
  host.contribute(designCanvas.keybindings, { "tool.scale": [{ key: "k" }] });
}
