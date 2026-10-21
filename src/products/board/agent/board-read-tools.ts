import { optionalRecord, optionalString, stringList, summarizeElement, type Rect } from "@canvas";

import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";

const NO_ARGS = { type: "object", properties: {} };

export const boardReadTools: BoardAgentTool[] = [
  {
    name: "get_board",
    description:
      "The board open in Cloudy Canvas: id, name (its title, or its file name), title and " +
      "description (set with set_board_info; read the description for what the board is " +
      "about), file path, unsaved changes, shape counts by type, selection and undo state. " +
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
      const { canUndo, canRedo } = engine.getState();
      const { title, description } = engine.doc.meta();
      return {
        open: true,
        id: board.id,
        name: title || board.name,
        title,
        description,
        path: board.path,
        dirty: board.dirty,
        shapeCount: engine.elements().length,
        shapesByType,
        selection: engine.selectedIds(),
        canUndo,
        canRedo,
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
        .map((el) => summarizeElement(engine.kinds, el));
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
    description: "The shapes the user has selected, as summaries.",
    inputSchema: NO_ARGS,
    run: (host) => {
      const { engine } = requireBoard(host);
      return engine
        .selectedIds()
        .map((id) => engine.getElement(id))
        .filter((el) => el !== undefined)
        .map((el) => summarizeElement(engine.kinds, el));
    },
  },
];

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
