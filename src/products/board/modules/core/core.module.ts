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
} from "./mcp";
import { boardMcpTools } from "../../board-points";
import { t } from "./core.i18n";
import * as coreApi from ".";
import * as coreUi from "./ui";
import { useBoardStartStarter } from "./ui/use-board-start-starter";
import { registerCoreCanvas } from "./core.canvas";

/**
 * What every board has whatever its modules: the select, scale (Shift+K; K is the sticker tool) and
 * hand tools' buttons (the tools are built into the engine), Hide UI (Ctrl+\) and the agent tools
 * that work on any element (reading, creating and editing through the kinds, arranging, viewing,
 * exporting, files and plugins).
 */
export const coreModule = defineModule({
  id: "core",
  tier: "core",
  exports: { ...coreApi, ...coreUi },
  register(host) {
    registerCoreCanvas(host);

    host.contribute(
      boardEditor.sessionHooks,
      { id: "hide-ui", use: useHideUiCommand },
      { id: "start-starter", use: useBoardStartStarter },
    );
    // The board's usual way of working, first in the mode switcher.
    host.contribute(boardEditor.modes, {
      id: DEFAULT_MODE.id,
      label: t("mode.label"),
      description: t("mode.description"),
      icon: PencilLine,
      order: 0,
    });
    host.contribute(
      boardMcpTools,
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
        label: t("tools.select.label"),
        description: t("tools.select.description"),
        icon: MousePointer2,
        toolbar: { group: 0, order: 10, menu: "move" },
      },
      {
        tool: "scale",
        label: t("tools.scale.label"),
        description: t("tools.scale.description"),
        icon: Scaling,
        toolbar: { group: 0, order: 15, menu: "move" },
      },
      {
        tool: "hand",
        label: t("tools.hand.label"),
        description: t("tools.hand.description"),
        icon: Hand,
        toolbar: { group: 0, order: 20 },
      },
    );
  },
});
