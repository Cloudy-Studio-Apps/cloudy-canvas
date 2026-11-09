import { MODEL_VIEW_SET_TOOL, setModelView, stringArg, type ModelBaker } from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { requireModelNode } from "./model-access";

/**
 * `model3d_view_set` (shared with boards): turns, zooms and re-textures a model, drawing its new
 * picture off screen.
 */
export function setModelNodeViewTool(baker: ModelBaker): DesignMcpTool {
  return {
    ...MODEL_VIEW_SET_TOOL,
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const el = requireModelNode(engine, stringArg(args, "id"));
      return setModelView({
        engine,
        el,
        args,
        baker,
        readFile: (path) => host.readFile(path),
        noun: "design",
      });
    },
  };
}
