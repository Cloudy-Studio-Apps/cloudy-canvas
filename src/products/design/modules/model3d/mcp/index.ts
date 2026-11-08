import type { ModelBaker } from "@canvas";

import type { DesignMcpTool } from "../../../mcp";
import { addModelNodeTool } from "./add-model-node.mcp";
import { convertModelNodeTool } from "./convert-model-node.mcp";
import { setModelNodeViewTool } from "./set-model-node-view.mcp";

/** The agent tools for 3D models; `baker` imports and draws them (it needs WebGL). */
export function modelNodeTools(baker: ModelBaker): DesignMcpTool[] {
  return [addModelNodeTool(baker), setModelNodeViewTool(baker), convertModelNodeTool];
}
