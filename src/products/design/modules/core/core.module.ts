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
  createNodesTool,
  designExportTools,
  designFileTools,
  designInfoTools,
  designReadTools,
  designViewTools,
  nodeArrangeTools,
  nodeTransformTools,
  nodeEditTools,
} from "./mcp";
import { designStyleTypes } from "./ui/core.points";
import { CORE_STYLE_TYPES } from "./ui/styles";

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
  register(host) {
    registerCoreCanvas(host);
    registerCoreCommands(host);

    host.contribute(
      designMcpTools,
      { id: "read", tools: () => designReadTools },
      { id: "info", tools: () => designInfoTools },
      { id: "nodes", tools: (context) => [createNodesTool(context), ...nodeEditTools] },
      { id: "arrange", tools: () => [...nodeArrangeTools, ...nodeTransformTools] },
      { id: "view", tools: () => designViewTools },
      { id: "export", tools: () => designExportTools },
      { id: "files", tools: () => designFileTools },
    );

    registerCoreSections(host);
    host.contribute(designStyleTypes, ...CORE_STYLE_TYPES);
    // The design's usual way of working, first in the mode switcher (shown once a module adds a
    // mode, e.g. Catalog).
    host.contribute(designEditor.modes, {
      id: DEFAULT_MODE.id,
      label: "Design",
      description: "Every tool and every layer.",
      icon: PenTool,
      order: 0,
    });
    registerCoreMenu(host);
  },
});
