import { assertModelFree, MODEL_CONVERT_TO_PNG_TOOL, stringArg } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { convertModelToRectangle } from "../convert-model";
import { requireModelNode } from "./model-access";

/**
 * `model3d_convert_to_png` (shared with boards): the model becomes a rectangle filled with its
 * picture (permanent).
 */
export const convertModelNodeTool: DesignMcpTool = {
  ...MODEL_CONVERT_TO_PNG_TOOL,
  run: async (host, args) => {
    const { engine } = requireDesign(host);
    const el = requireModelNode(engine, stringArg(args, "id"));
    assertModelFree(engine, el.id, "design");
    return { id: convertModelToRectangle(engine, el) };
  },
};
