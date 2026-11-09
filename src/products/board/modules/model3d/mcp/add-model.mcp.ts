import {
  ADD_MODEL_PROPERTIES,
  agentModelReport,
  asUndoStep,
  MODEL_BASE_SIZE,
  readAgentModel,
  storeModel,
  type ModelBaker,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { createModel } from "../model3d.factory";

/** `add_model`: places a model file as a 3D model, as dropping it does (no size dialog). */
export function addModelTool(baker: ModelBaker): BoardMcpTool {
  return {
    name: "add_model",
    description:
      "Places a 3D model file (GLB, glTF, OBJ with its .mtl, FBX) on the board as a 3D model, as " +
      "dropping it does, in one undo step. Textures next to the file are found by their names; " +
      "`textures` assigns a picture file to a slot by hand. It is shown as a picture of the model " +
      "(turn it with set_model_view, move and resize it with update_shapes); it is `h` tall " +
      `(${MODEL_BASE_SIZE} by default) with the width of its framing. Returns its id, its texture ` +
      "slots, the `missing` ones (shown gray) and, over 10 MB, a `warning` that large files can " +
      "cause problems. A placed model is reused: move or resize it with update_shapes and turn it " +
      "with set_model_view instead of adding the file again.",
    inputSchema: { type: "object", required: ["path"], properties: ADD_MODEL_PROPERTIES },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      if (engine.doc.isReadOnly) throw new Error("This board is read-only.");
      const { imp, rect } = await readAgentModel(args, baker, (path) => host.readFile(path));
      const stored = await storeModel(baker, imp, rect, engine.doc);
      const model = createModel(stored, rect, engine.doc.nextIndex());
      asUndoStep(engine.doc, () => engine.doc.add(model));
      return { id: model.id, ...agentModelReport(stored, imp, "board"), ...rect };
    },
  };
}
