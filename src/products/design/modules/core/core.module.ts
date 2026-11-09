import { PenTool } from "lucide-react";

import { DEFAULT_MODE } from "@canvas";
import { defineModule } from "@shared/core";
import { designEditor } from "@design/ui/modules/design-editor-points";
import { designMcpTools } from "../../design-points";
import { registerCoreCanvas } from "./core.canvas";
import { registerCoreCommands } from "./core.commands";
import { registerCoreMenu } from "./core.menu";
import { registerCoreSections } from "./core.sections";
import {
  arrangeTools,
  clipboardTools,
  createNodesTool,
  designExportTools,
  designReadTools,
  fileTools,
  historyTools,
  nodeEditTools,
  nodeOrderTools,
  nodeTransformTools,
  selectionTools,
  styleTools,
  viewTools,
} from "./mcp";
import { designStyleTypes } from "./ui/core.points";
import { CORE_STYLE_TYPES } from "./ui/styles";
import { t } from "./core.i18n";
import * as coreApi from ".";
import * as coreUi from "./ui";

/**
 * What every design has whatever its modules: the canvas view (plain, pixel grid, 2%–25600%, size
 * label, snapping) and the layer tree's hooks (`core.canvas.ts`), its commands
 * (`core.commands.ts`), the move, scale (K) and hand buttons and the properties panel's shared
 * sections (`core.sections.ts`), the main menu (`core.menu.ts`), color and stroke styles, and the
 * agent tools that work on any layer (reading, creating and editing through the kinds, arranging,
 * viewing, exporting, files).
 */
export const coreModule = defineModule({
  id: "core",
  tier: "core",
  exports: { ...coreApi, ...coreUi },
  register(host) {
    registerCoreCanvas(host);
    registerCoreCommands(host);

    // The topics designs share with boards, then the layer tools (renamed to `nodes_*` later).
    host.contribute(
      designMcpTools,
      { id: "file", prefix: "file", tools: () => fileTools },
      { id: "selection", prefix: "selection", tools: () => selectionTools },
      { id: "history", prefix: "history", tools: () => historyTools },
      { id: "view", prefix: "view", tools: () => viewTools },
      { id: "clipboard", prefix: "clipboard", tools: () => clipboardTools },
      { id: "arrange", prefix: "arrange", tools: () => arrangeTools },
      { id: "style", prefix: "style", tools: () => styleTools },
      { id: "read", prefix: "design", tools: () => designReadTools },
      {
        id: "nodes",
        prefix: "design",
        tools: (context) => [createNodesTool(context), ...nodeEditTools],
      },
      {
        id: "order",
        prefix: "design",
        tools: () => [...nodeOrderTools, ...nodeTransformTools],
      },
      { id: "export", prefix: "design", tools: () => designExportTools },
    );

    registerCoreSections(host);
    host.contribute(designStyleTypes, ...CORE_STYLE_TYPES);
    // The design's usual way of working, first in the mode switcher (shown once a module adds a
    // mode, e.g. Catalog).
    host.contribute(designEditor.modes, {
      id: DEFAULT_MODE.id,
      label: t("modes.design.label"),
      description: t("modes.design.description"),
      icon: PenTool,
      order: 0,
    });
    registerCoreMenu(host);
  },
});
