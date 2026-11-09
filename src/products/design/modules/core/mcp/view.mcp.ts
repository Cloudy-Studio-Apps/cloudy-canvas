import {
  bytesToBase64,
  optionalNumber,
  stringList,
  VIEW_FIT_ELEMENTS_TOOL,
  VIEW_FIT_TOOL,
  VIEW_SNAPSHOT_MAX_SIDE,
  VIEW_SNAPSHOT_TOOL,
} from "@canvas";
import { ToolImage } from "@shared/core";

import { optionalNodeIds, requireDesign, requireNodes, type DesignMcpTool } from "../../../mcp";

/** The design's side of the shared `view` topic: `view_fit`, `view_fit_elements`, `view_snapshot`. */
export const viewTools: DesignMcpTool[] = [
  {
    ...VIEW_FIT_TOOL,
    run: (host) => {
      requireDesign(host).engine.zoomToFit();
      return "Done.";
    },
  },
  {
    ...VIEW_FIT_ELEMENTS_TOOL,
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      if (ids.length === 0) throw new Error('Give the "ids" of the layers to show.');
      engine.zoomToElements(ids);
      return "Done.";
    },
  },
  {
    ...VIEW_SNAPSHOT_TOOL,
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const png = await engine.exportElements({
        format: "png",
        background: "solid",
        area: "board",
        ids: optionalNodeIds(engine, args),
        scale: optionalNumber(args, "scale") ?? 1,
        maxSide: VIEW_SNAPSHOT_MAX_SIDE,
        asShown: true,
      });
      return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
    },
  },
];
