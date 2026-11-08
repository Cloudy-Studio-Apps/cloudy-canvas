import { assertModelFree, stringArg } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { convertModelToRectangle } from "../convert-model";
import { requireModelNode } from "./model-access";

/** `convert_model_node_to_png`: the model becomes a rectangle filled with its picture (permanent). */
export const convertModelNodeTool: DesignMcpTool = {
  name: "convert_model_node_to_png",
  description:
    "Turns a 3D model layer into a rectangle filled with its current picture, in the same " +
    "place, size and layer settings, in one undo step. The 3D data is forgotten (the file gets " +
    "lighter once the design is closed), so only call it when the user asked for it, never on " +
    'your own. Returns the new rectangle\'s id. Fails with "being edited" while a person has ' +
    "the model open in 3D.",
  inputSchema: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string" } },
  },
  run: async (host, args) => {
    const { engine } = requireDesign(host);
    const el = requireModelNode(engine, stringArg(args, "id"));
    assertModelFree(engine, el.id, "design");
    return { id: convertModelToRectangle(engine, el) };
  },
};
