import { Flag, MousePointer2, Play, Spline } from "lucide-react";

import type { ModeToolbarEntry } from "@canvas-ui";
import { PROTOTYPE_COMMANDS, PROTOTYPE_TOOLS } from "../../prototype.constants";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { usePrototypeSelection } from "../hooks/use-prototype-selection";
import { t } from "../../prototype.i18n";

/**
 * The Prototype mode's toolbar: select, hand and connect, then the flow start (needs a free
 * screen), then Play, the mode's main action.
 */
export function usePrototypeToolbarItems(): readonly ModeToolbarEntry[] {
  const selection = usePrototypeSelection();
  const { flows } = usePrototypePage();
  const screen =
    selection.kind === "screen"
      ? selection.id
      : selection.kind === "layer"
        ? selection.screen
        : null;
  const free = screen !== null && !flows.some((flow) => flow.start === screen);
  return [
    {
      tool: PROTOTYPE_TOOLS.select,
      label: t("toolbar.select"),
      description: t("toolbar.selectHint"),
      icon: MousePointer2,
    },
    { tool: "hand" },
    {
      tool: PROTOTYPE_TOOLS.connect,
      label: t("toolbar.connect"),
      description: t("toolbar.connectHint"),
      icon: Spline,
    },
    "divider",
    {
      command: PROTOTYPE_COMMANDS.addFlow,
      label: t("toolbar.addFlow"),
      description: t("toolbar.addFlowHint"),
      icon: Flag,
      disabled: !free,
    },
    "divider",
    {
      command: PROTOTYPE_COMMANDS.play,
      label: t("toolbar.play"),
      description: t("toolbar.playHint"),
      icon: Play,
      primary: true,
    },
  ];
}
