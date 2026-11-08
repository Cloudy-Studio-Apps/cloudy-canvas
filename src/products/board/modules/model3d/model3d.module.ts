import { modelBaker } from "@canvas-ui";
import { defineModule } from "@shared/core";
import { boardMcpTools } from "../../board-points";
import { registerModel3dCanvas } from "./model3d.canvas";
import { registerModel3dCommands } from "./model3d.commands";
import { modelTools } from "./mcp";
import { registerModel3dSections } from "./model3d.sections";
import * as model3dApi from ".";
import * as model3dUi from "./ui";

/**
 * 3D models on the board: the kind and the picture it shows (`model3d.canvas.ts`), dropping and
 * placing model files, the live 3D view, the panel and the context menu (`model3d.sections.ts`),
 * and the agents' tools (`model3d.mcp.ts`).
 */
export const model3dModule = defineModule({
  id: "model3d",
  tier: "feature",
  exports: { ...model3dApi, ...model3dUi },
  register(host) {
    registerModel3dCanvas(host);
    registerModel3dCommands(host);
    registerModel3dSections(host);
    host.contribute(boardMcpTools, { id: "model3d", tools: () => modelTools(modelBaker) });
  },
});
