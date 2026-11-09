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

import { optionalShapeIds, requireBoard, requireShapes } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

/** The board's side of the shared `view` topic: `view_fit`, `view_fit_elements`, `view_snapshot`. */
export const viewTools: BoardMcpTool[] = [
  {
    ...VIEW_FIT_TOOL,
    run: (host) => {
      requireBoard(host).engine.zoomToFit();
      return "Done.";
    },
  },
  {
    ...VIEW_FIT_ELEMENTS_TOOL,
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = requireShapes(engine, stringList(args, "ids"));
      if (ids.length === 0) throw new Error('Give the "ids" of the shapes to show.');
      engine.zoomToElements(ids);
      return "Done.";
    },
  },
  {
    ...VIEW_SNAPSHOT_TOOL,
    run: async (host, args) => {
      const { engine } = requireBoard(host);
      const png = await engine.exportElements({
        format: "png",
        background: "solid",
        area: "board",
        ids: optionalShapeIds(engine, args),
        scale: optionalNumber(args, "scale") ?? 1,
        maxSide: VIEW_SNAPSHOT_MAX_SIDE,
      });
      return new ToolImage(bytesToBase64(new Uint8Array(await png.arrayBuffer())), "image/png");
    },
  },
];
