import { Hand, MousePointer2, PencilLine, Scaling } from "lucide-react";

import { DEFAULT_MODE } from "@canvas";
import { useHideUiCommand } from "@canvas-ui";
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
import { boardAgentTools, boardCanvas } from "../../board-points";

/**
 * What every board has whatever its modules: the select, scale (Shift+K; K is the sticker tool) and
 * hand tools' buttons (the tools are built into the engine), Hide UI (Ctrl+\) and the agent tools
 * that work on any element (reading, creating and editing through the kinds, arranging, viewing,
 * exporting, files and plugins).
 */
export const coreModule = defineModule({
  id: "core",
  register(host) {
    host.contribute(boardCanvas.keybindings, { "tool.scale": [{ key: "k", shift: true }] });
    host.contribute(boardCanvas.hostCommands, {
      id: "toggleUi",
      label: "Hide UI",
      keys: [{ code: "Backslash", mod: true, label: "\\" }],
    });
    host.contribute(boardEditor.sessionHooks, { id: "hide-ui", use: useHideUiCommand });
    // The board's usual way of working, first in the mode switcher.
    host.contribute(boardEditor.modes, {
      id: DEFAULT_MODE.id,
      label: "Board",
      description: "Every tool and every element.",
      icon: PencilLine,
      order: 0,
    });
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
        toolbar: { group: 0, order: 10, menu: "move" },
      },
      {
        tool: "scale",
        label: "Scale",
        description: "Scale with the content: text, strokes and what's inside grow together.",
        icon: Scaling,
        toolbar: { group: 0, order: 15, menu: "move" },
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
