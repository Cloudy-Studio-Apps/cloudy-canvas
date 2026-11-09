import { MODEL_VIEW_SET_TOOL, setModelView, stringArg, type ModelBaker } from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";
import { requireModel } from "./model-access";

/**
 * `model3d_view_set` (shared with designs): turns, zooms and re-textures a model, drawing its new
 * picture off screen.
 */
export function setModelViewTool(baker: ModelBaker): BoardMcpTool {
  return {
    ...MODEL_VIEW_SET_TOOL,
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
