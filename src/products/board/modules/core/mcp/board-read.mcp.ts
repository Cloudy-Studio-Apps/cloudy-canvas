import {
  optionalRecord,
  optionalString,
  stringList,
  summarizeElement,
  TokenStore,
  type Rect,
} from "@canvas";

import { boundColors } from "../../../tokens";

import { requireBoard } from "../../../mcp/board-access";
import type { BoardMcpTool } from "../../../mcp/board-mcp.types";

export const boardReadTools: BoardMcpTool[] = [
  {
    name: "list_shapes",
    description:
      "Lists the board's shapes bottom to top as summaries (id, type, bounds, label). Filter by " +
      "type or by a world-space area. Use get_shapes for every field.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", description: "Only this shape type, e.g. sticky or geo." },
        within: {
          type: "object",
          description: "Only shapes overlapping this area.",
          properties: {
            x: { type: "number" },
            y: { type: "number" },
            w: { type: "number" },
            h: { type: "number" },
          },
          required: ["x", "y", "w", "h"],
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const type = optionalString(args, "type");
      const within = optionalRecord(args, "within") as Rect | undefined;
      return engine
        .elements()
        .filter((el) => (!type || el.type === type) && (!within || overlaps(el, within)))
        .map((el) => ({
          ...summarizeElement(engine.kinds, el),
          ...boundColors(TokenStore.of(engine.doc), el),
        }));
    },
  },
  {
    name: "get_shapes",
    description: "Every field of the given shapes.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      return stringList(args, "ids").map((id) => engine.getElement(id) ?? { id, missing: true });
    },
  },
];

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
