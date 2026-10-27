import { Network } from "lucide-react";

import { defineBoardMode } from "@board/ui/modules";
import { isErElement } from "./base/is-er-element";
import { ER_MODE_COMMANDS, ER_MODE_ID } from "./mode";
import { ErCheckBadges, runErModeCommand, useErToolbarItems } from "./ui/er-mode";

/**
 * The ER mode: only the board's ER shapes (every diagram, so linking two still joins them) can be
 * reached, with the select, hand and ER tools; other tools wait until it's left. Its keys add ER
 * shapes (`ER_MODE_COMMANDS`, host commands with no keys of their own that the mode binds). It's
 * entered from the mode switcher, by double-clicking an ER shape (`enterErMode`) or with the
 * panel's Edit diagram; its toolbar and the Check diagram's badges show while it's on.
 */
export const erMode = defineBoardMode({
  id: ER_MODE_ID,
  label: "ER diagrams",
  description: "Only ER diagrams can be selected, with their toolbar, palette and panel.",
  icon: Network,
  order: 10,
  tool: "select",
  allowTools: ["hand", "er"],
  isolate: isErElement,
  keybindings: Object.fromEntries(ER_MODE_COMMANDS.map(({ command, keys }) => [command, keys])),
  hostCommands: ER_MODE_COMMANDS.map(({ command, label, item }) => ({
    id: command,
    label,
    run: (engine) => runErModeCommand(engine, item),
  })),
  toolbar: { useItems: useErToolbarItems },
  overlays: [ErCheckBadges],
});
