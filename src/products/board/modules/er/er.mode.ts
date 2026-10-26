import { Network } from "lucide-react";

import type { ModuleHost } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import { boardCanvas } from "../../board-points";
import { enterErMode, ER_MODE, ER_MODE_COMMANDS, ER_MODE_ID } from "./mode";
import { ErCheckBadges, ErModeToolbar, useErModeCommands } from "./ui/er-mode";
import { ErPalette } from "./ui/er-palette";

/** The ER mode: its canvas mode and keys, entering it, its toolbar, palette and check badges. */
export function registerErMode(host: ModuleHost): void {
  // The ER mode; entered from the mode switcher, by double-clicking an ER shape or with the
  // panel's Edit diagram.
  host.contribute(boardCanvas.modes, ER_MODE);
  // The ER mode's keys: host commands with no keys of their own (the mode binds them).
  host.contribute(
    boardCanvas.hostCommands,
    ...ER_MODE_COMMANDS.map(({ command, label }) => ({ id: command, label })),
  );
  host.contribute(boardEditor.sessionHooks, { id: "er.modeCommands", use: useErModeCommands });
  // The Check diagram's findings on the shapes, while the ER mode is on.
  host.contribute(boardEditor.overlays, { id: "er.checkBadges", component: ErCheckBadges });
  host.contribute(boardCanvas.editElement, enterErMode);
  // The element types, to click or drag onto the board while a diagram is being edited.
  host.contribute(boardEditor.overlays, { id: "er.palette", component: ErPalette });
  host.contribute(boardEditor.modes, {
    id: ER_MODE_ID,
    label: "ER diagrams",
    description: "Only ER diagrams can be selected, with their toolbar, palette and panel.",
    icon: Network,
    order: 10,
    toolbar: ErModeToolbar,
  });
}
