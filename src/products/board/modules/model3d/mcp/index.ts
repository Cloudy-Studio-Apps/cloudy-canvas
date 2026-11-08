import type { ModelBaker } from "@canvas";

import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { addModelTool } from "./add-model.mcp";
import { convertModelTool } from "./convert-model.mcp";
import { setModelViewTool } from "./set-model-view.mcp";

/** The agent tools for 3D models; `baker` imports and draws them (it needs WebGL). */
export function modelTools(baker: ModelBaker): BoardMcpTool[] {
  return [addModelTool(baker), setModelViewTool(baker), convertModelTool];
}
