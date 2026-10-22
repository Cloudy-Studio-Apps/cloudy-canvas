import { Hand, MousePointer2 } from "lucide-react";

import { defineModule } from "@shared/core";
import { boardEditor } from "@board/ui/modules/board-editor-points";
import {
  arrangeTools,
  boardInfoTools,
  boardReadTools,
  createShapesTool,
  exportTools,
  fileTools,
  pluginTools,
  shapeEditTools,
  viewTools,
} from "../../agent";
import { boardAgentTools } from "../../board-points";

/**
 * What every board has whatever its modules: the select and hand tools' buttons (the tools are
 * built into the engine) and the agent tools that work on any element (reading, creating and
 * editing through the kinds, arranging, viewing, exporting, files and plugins).
 */
export const coreModule = defineModule({
  id: "core",
  register(host) {
    host.contribute(
      boardAgentTools,
      { id: "read", tools: () => boardReadTools },
      { id: "info", tools: () => boardInfoTools },
      { id: "shapes", tools: (context) => [createShapesTool(context), ...shapeEditTools] },
      { id: "arrange", tools: () => arrangeTools },
      { id: "view", tools: () => viewTools },
      { id: "export", tools: () => exportTools },
      { id: "files", tools: () => fileTools },
      { id: "plugins", tools: () => pluginTools },
    );

    host.contribute(
      boardEditor.tools,
      {
        tool: "select",
        label: "Select",
        description: "Select, move and resize. Double-click to edit text.",
        icon: MousePointer2,
        toolbar: { group: 0, order: 10 },
      },
      {
        tool: "hand",
        label: "Hand",
        description: "Pan around the board.",
        icon: Hand,
        toolbar: { group: 0, order: 20 },
      },
    );
  },
});
