import { assertModelFree, MODEL_CONVERT_TO_PNG_TOOL, stringArg } from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { convertModelToImage } from "../convert-model";
import { requireModel } from "./model-access";

/**
 * `model3d_convert_to_png` (shared with designs): the model becomes a plain image of its picture
 * (permanent).
 */
export const convertModelTool: BoardMcpTool = {
  ...MODEL_CONVERT_TO_PNG_TOOL,
  run: async (host, args) => {
    const { engine } = requireBoard(host);
    const el = requireModel(engine, stringArg(args, "id"));
    assertModelFree(engine, el.id, "board");
    return { id: convertModelToImage(engine, el) };
  },
};
