import { modelBaker } from "@canvas-ui";
import { defineModule } from "@shared/core";
import { designMcpTools } from "../../design-points";
import { modelNodeTools } from "./mcp";
import { registerModel3dCanvas } from "./model3d.canvas";
import { registerModel3dSections } from "./model3d.sections";
import * as model3dApi from ".";
import * as model3dUi from "./ui";

/**
 * 3D models on designs: the kind and the picture it shows (`model3d.canvas.ts`), dropping and
 * placing model files, the live 3D view, the panel and the menus (`model3d.sections.ts`), and
 * the agents' tools (`mcp/`). Converting a model makes a rectangle, so it requires `rectangle`.
 */
export const model3dModule = defineModule({
  id: "model3d",
  tier: "feature",
  requires: ["rectangle"],
  exports: { ...model3dApi, ...model3dUi },
  register(host) {
    registerModel3dCanvas(host);
    registerModel3dSections(host);
    host.contribute(designMcpTools, { id: "model3d", tools: () => modelNodeTools(modelBaker) });
  },
});
