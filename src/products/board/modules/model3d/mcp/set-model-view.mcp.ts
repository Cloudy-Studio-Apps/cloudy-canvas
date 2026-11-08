import { SET_MODEL_VIEW_PROPERTIES, setModelView, stringArg, type ModelBaker } from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { requireModel } from "./model-access";

/** `set_model_view`: turns, zooms and re-textures a model, drawing its new picture off screen. */
export function setModelViewTool(baker: ModelBaker): BoardMcpTool {
  return {
    name: "set_model_view",
    description:
      "Changes how a 3D model is shown: `angle` ({ x, y, z } degrees), `zoom` (0.1 to 10, 1 " +
      "fits it in its box) and `textures` (slot name to an absolute picture path, or null to " +
      "clear the slot). The picture is drawn off screen and everything is one undo step; check " +
      'the result with view_board. Fails with "being edited" while a person has the model ' +
      "open in 3D: wait for them to finish and try again.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: SET_MODEL_VIEW_PROPERTIES,
    },
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const el = requireModel(engine, stringArg(args, "id"));
      return setModelView({
        engine,
        el,
        args,
        baker,
        readFile: (path) => host.readFile(path),
        noun: "board",
      });
    },
  };
}
