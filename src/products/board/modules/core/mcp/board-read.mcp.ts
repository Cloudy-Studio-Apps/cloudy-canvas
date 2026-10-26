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

const NO_ARGS = { type: "object", properties: {} };

export const boardReadTools: BoardMcpTool[] = [
  {
    name: "get_board",
    description:
      "The board open in Cloudy Canvas: id, name (its title, or its file name), title and " +
      "description (set with set_board_info; read the description for what the board is " +
      "about), file path, unsaved changes, shape counts by type, the user's selection " +
      "(`selection`) and yours (`yourSelection`), your undo state, and `editable` (false when " +
      "the board is shared with the user to view only: then you can only read it). " +
      "Returns { open: false } when no board is open.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const board = host.board();
      if (!board) return { open: false };
      const { engine } = board;
      const shapesByType: Record<string, number> = {};
      for (const el of engine.elements()) {
        shapesByType[el.type] = (shapesByType[el.type] ?? 0) + 1;
      }
      const { title, description } = engine.doc.meta();
      return {
        open: true,
        id: board.id,
        name: title || board.name,
        title,
        description,
        path: board.path,
        dirty: board.dirty,
        editable: !engine.doc.isReadOnly,
        shapeCount: engine.elements().length,
        shapesByType,
        selection: engine.userSelection(),
        yourSelection: engine.selectedIds(),
        canUndo: engine.canUndo(),
        canRedo: engine.canRedo(),
      };
    },
  },
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
  {
    name: "get_selection",
    description:
      "The shapes the user has selected, as summaries (not yours: select_shapes sets yours).",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireBoard(host);
      return engine
        .userSelection()
        .map((id) => engine.getElement(id) ?? engine.doc.get(id))
        .filter((el) => el !== undefined)
        .map((el) => ({
          ...summarizeElement(engine.kinds, el),
          ...boundColors(TokenStore.of(engine.doc), el),
        }));
    },
  },
];

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
