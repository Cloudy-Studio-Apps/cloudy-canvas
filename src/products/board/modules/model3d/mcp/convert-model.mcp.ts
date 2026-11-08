import { stringArg } from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { convertModelToImage } from "../convert-model";
import { assertModelFree, requireModel } from "./model-access";

/** `convert_model_to_png`: the model becomes a plain image of its picture (permanent). */
export const convertModelTool: BoardMcpTool = {
  name: "convert_model_to_png",
  description:
    "Turns a 3D model into a plain image of its current picture, in the same place and size, " +
    "in one undo step. The 3D data is forgotten (the file gets lighter once the board is " +
    "closed), so only call it when the user asked for it, never on your own. Returns the new " +
    'image\'s id. Fails with "being edited" while a person has the model open in 3D.',
  inputSchema: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string" } },
  },
  run: async (host, args) => {
    const { engine } = requireBoard(host);
    const el = requireModel(engine, stringArg(args, "id"));
    assertModelFree(engine, el.id);
    return { id: convertModelToImage(engine, el) };
  },
};
