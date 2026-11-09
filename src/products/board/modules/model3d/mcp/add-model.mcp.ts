import {
  agentModelReport,
  asUndoStep,
  MODEL_ADD_TOOL,
  readAgentModel,
  storeModel,
  type ModelBaker,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { createModel } from "../model3d.factory";

/**
 * `model3d_add` (shared with designs, which also take `name` and `parent`): places a model file
 * as a 3D model, as dropping it does (no size dialog).
 */
export function addModelTool(baker: ModelBaker): BoardMcpTool {
  return {
    ...MODEL_ADD_TOOL,
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      if (engine.doc.isReadOnly) throw new Error("This board is read-only.");
      const { imp, rect } = await readAgentModel(args, baker, (path) => host.readFile(path));
      const stored = await storeModel(baker, imp, rect, engine.doc);
      // The bake took time: check again before writing.
      if (engine.doc.isReadOnly) throw new Error("This board is read-only.");
      const model = createModel(stored, rect, engine.doc.nextIndex());
      asUndoStep(engine.doc, () => engine.doc.add(model));
      return { id: model.id, ...agentModelReport(stored, imp, "board"), ...rect };
    },
  };
}
