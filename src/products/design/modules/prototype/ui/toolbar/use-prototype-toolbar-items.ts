import { Flag, MousePointer2 } from "lucide-react";

import type { ModeToolbarEntry } from "@canvas-ui";
import { PROTOTYPE_COMMANDS, PROTOTYPE_TOOLS } from "../../prototype.constants";
import { usePrototypePage } from "../hooks/use-prototype-page";
import { usePrototypeSelection } from "../hooks/use-prototype-selection";
import { t } from "../../prototype.i18n";

/** The Prototype mode's toolbar: select and hand, then the flow start (needs a free screen). */
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
    "divider",
    {
      command: PROTOTYPE_COMMANDS.addFlow,
      label: t("toolbar.addFlow"),
      description: t("toolbar.addFlowHint"),
      icon: Flag,
      disabled: !free,
    },
  ];
}
