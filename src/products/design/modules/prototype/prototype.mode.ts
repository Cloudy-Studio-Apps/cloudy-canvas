import { Workflow } from "lucide-react";

import { defineDesignMode } from "@design/ui/modules";
import { ConnectTool, PROTOTYPE_ALLOWED_COMMANDS, PrototypeSelectTool } from "./mode";
import { PROTOTYPE_COMMANDS, PROTOTYPE_MODE_ID, PROTOTYPE_TOOLS } from "./prototype.constants";
import { addFlowAtSelection } from "./ui/add-flow";
import { ConnectHandle } from "./ui/canvas/connect-handle";
import { DragLine } from "./ui/canvas/drag-line";
import { LinksLayer } from "./ui/canvas/links-layer";
import { FlowsTab } from "./ui/flows-tab/flows-tab";
import { PrototypeSidebar } from "./ui/sidebar/prototype-sidebar";
import { usePrototypeToolbarItems } from "./ui/toolbar/use-prototype-toolbar-items";
import { t } from "./prototype.i18n";

/**
 * The Prototype mode: a page's top-level frames as screens to link. The select-only tool (whose
 * handle drags a link out of the selection), the Connect tool, the hand and only the commands that
 * organize run; the Flows tab (plus Layers), the sidebar, the toolbar and the canvas overlays (the
 * links, the connect handle and the dragged link) show while it's on. Shift+E enters and leaves
 * it (`prototype.module.ts`).
 */
export const prototypeMode = defineDesignMode({
  id: PROTOTYPE_MODE_ID,
  label: t("mode.label"),
  description: t("mode.description"),
  icon: Workflow,
  order: 5,
  tool: PROTOTYPE_TOOLS.select,
  tools: [
    { id: PROTOTYPE_TOOLS.select, create: (ctx) => new PrototypeSelectTool(ctx) },
    { id: PROTOTYPE_TOOLS.connect, create: (ctx) => new ConnectTool(ctx) },
  ],
  allowTools: ["hand"],
  commands: PROTOTYPE_ALLOWED_COMMANDS,
  // The tools' keys live here, in the mode's layer, matched before the product's: as tool `keys`
  // they'd lose V to the select tool's (the first binding wins) and take L from the line tool
  // in the Design mode.
  keybindings: {
    [`tool.${PROTOTYPE_TOOLS.select}`]: [{ key: "v" }],
    [`tool.${PROTOTYPE_TOOLS.connect}`]: [{ key: "l" }],
    [PROTOTYPE_COMMANDS.addFlow]: [{ key: "f", shift: true }],
  },
  // Delete clears interactions here; layers are never deleted.
  commandLabels: { deleteSelection: t("mode.removeInteractions") },
  hostCommands: [
    {
      id: PROTOTYPE_COMMANDS.addFlow,
      label: t("toolbar.addFlow"),
      run: addFlowAtSelection,
    },
  ],
  toolbar: { useItems: usePrototypeToolbarItems },
  rail: {
    tabs: [{ id: "flows", label: t("flows.title"), icon: Workflow, component: FlowsTab }],
    keep: ["layers"],
  },
  sidebar: PrototypeSidebar,
  overlays: [LinksLayer, ConnectHandle, DragLine],
});
