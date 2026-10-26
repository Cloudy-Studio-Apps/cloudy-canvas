import {
  asUndoStep,
  DOCUMENT_TOKENS,
  optionalString,
  recordList,
  requireAxis,
  requireMode,
  stringArg,
  tokenName,
  type CanvasElement,
  type ToolArgs,
} from "@canvas";

import { requireBoard } from "../../../mcp/board-access";
import type { AgentBoard, BoardMcpTool } from "../../../mcp/board-mcp.types";
import { LIST_TOOL, requireColor } from "./color-args";

const FIELD = {
  type: "string",
  description:
    'Which color: "color" (stickies, texts, pen strokes, connectors, sections, a table\'s ' +
    'header), "fill" or "stroke" (shapes), "fills.<row>.<column>" (a table cell, from 0). ' +
    "Default: the shape's first.",
};

/** The shape and the color field an agent's item names (checked against what its kind binds). */
function shapeField(board: AgentBoard, item: ToolArgs): { el: CanvasElement; field: string } {
  const id = stringArg(item, "id");
  const el = board.engine.getElement(id);
  if (!el) throw new Error(`No shape with id ${id}.`);
  const fields = board.engine.kinds.kindOf(el).bindable(el);
  if (fields.length === 0) throw new Error(`A ${el.type} has no color a board color can drive.`);
  const field = optionalString(item, "field") ?? fields[0]?.path ?? "";
  if (!fields.some((f) => f.path === field)) {
    throw new Error(
      `A ${el.type} has no color "${field}" (it has: ${fields
        .slice(0, 6)
        .map((f) => f.path)
        .join(", ")}).`,
    );
  }
  return { el, field };
}

/** Linking shapes' colors to board colors, and the mode the board shows. */
export const colorsBindTools: BoardMcpTool[] = [
  {
    name: "bind_board_colors",
    description:
      "Links shapes' colors to board colors: each takes the color's value now and follows it " +
      "when it (or the board's mode) changes. Setting the field by hand later unlinks it.",
    inputSchema: {
      type: "object",
      required: ["bindings"],
      properties: {
        bindings: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "color"],
            properties: {
              id: { type: "string", description: "The shape's id." },
              field: FIELD,
              color: { type: "string", description: "The board color's id or name." },
            },
          },
        },
      },
    },
    run: (host, args) => {
      const board = requireBoard(host);
      const tokens = board.engine.service(DOCUMENT_TOKENS);
      const planned = recordList(args, "bindings").map((item) => ({
        ...shapeField(board, item),
        color: requireColor(tokens, stringArg(item, "color")).id,
      }));
      asUndoStep(board.engine.doc, () => {
        for (const { el, field, color } of planned) {
          const current = board.engine.doc.get(el.id)?.bindings ?? {};
          board.engine.doc.update(el.id, { bindings: { ...current, [field]: color } });
        }
      });
      const store = tokens.store();
      return planned.map(({ el, field, color }) => ({
        id: el.id,
        field,
        color: tokenName(store, color),
      }));
    },
  },
  {
    name: "unbind_board_colors",
    description: "Unlinks shapes' colors from board colors; they keep the color they show.",
    inputSchema: {
      type: "object",
      required: ["bindings"],
      properties: {
        bindings: {
          type: "array",
          items: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" },
              field: { ...FIELD, description: "Which color (default: every linked one)." },
            },
          },
        },
      },
    },
    run: (host, args) => {
      const board = requireBoard(host);
      // Every shape is checked before anything is unlinked.
      const items = recordList(args, "bindings").map((item) => {
        const id = stringArg(item, "id");
        const el = board.engine.doc.get(id);
        if (!el) throw new Error(`No shape with id ${id}.`);
        return { id, field: optionalString(item, "field") };
      });
      let unlinked = 0;
      asUndoStep(board.engine.doc, () => {
        for (const { id, field } of items) {
          const el = board.engine.doc.get(id);
          if (!el) continue;
          const bindings = { ...el.bindings };
          for (const path of Object.keys(bindings)) {
            if (field === undefined || path === field) {
              delete bindings[path];
              unlinked++;
            }
          }
          board.engine.doc.update(id, { bindings });
        }
      });
      return { unlinked };
    },
  },
  {
    name: "set_board_color_mode",
    description:
      "Picks the mode the whole board shows on an axis (e.g. Theme: Dark): every shape bound to " +
      "a color varying by it takes that mode's color.",
    inputSchema: {
      type: "object",
      required: ["axis", "mode"],
      properties: {
        axis: { type: "string", description: "The axis's id or name." },
        mode: { type: "string", description: "The mode's id or name." },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const axis = requireAxis(tokens.store(), stringArg(args, "axis"), LIST_TOOL);
      const mode = requireMode(axis, stringArg(args, "mode"));
      asUndoStep(engine.doc, () => tokens.setCurrentMode(axis.id, mode));
      return { axis: axis.name, mode: axis.modes.find((m) => m.id === mode)?.name };
    },
  },
];
