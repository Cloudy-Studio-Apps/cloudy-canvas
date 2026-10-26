import {
  asUndoStep,
  describeVariable,
  DOCUMENT_TOKENS,
  optionalString,
  recordList,
  requireCollection,
  stringArg,
  stringList,
  type DocumentTokens,
  type ToolArgs,
} from "@canvas";

import { requireBoard } from "../../../agent/board-access";
import type { BoardAgentTool } from "../../../agent/board-agent.types";
import { checkedTokenEdit } from "./checked-edit";
import { COLOR_VALUE_FIELDS, LIST_TOOL, requireColor, writeColorValues } from "./color-args";

/** The collection a new color goes in: the one named (made when missing), else the first. */
function collectionFor(tokens: DocumentTokens, item: ToolArgs): string {
  const name = optionalString(item, "collection");
  const store = tokens.store();
  if (name) {
    const found = store.collection(name) ?? store.collections().find((c) => c.name === name);
    return (found ?? tokens.createCollection(name)).id;
  }
  return (store.collections()[0] ?? tokens.createCollection("Colors")).id;
}

/** Making, changing and deleting the board's colors; one undo step per call. */
export const colorsEditTools: BoardAgentTool[] = [
  {
    name: "create_board_colors",
    description:
      "Adds colors to the board (color variables): offered first in every color bar, and shapes " +
      "bound to one (bind_board_colors) follow it when it changes. Slashes in a name group it " +
      '("brand/blue").',
    inputSchema: {
      type: "object",
      required: ["colors"],
      properties: {
        colors: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "value"],
            properties: {
              name: { type: "string" },
              collection: {
                type: "string",
                description:
                  "Its collection by name or id (made when missing; default: the first).",
              },
              description: { type: "string" },
              ...COLOR_VALUE_FIELDS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const items = recordList(args, "colors");
      const ids = checkedTokenEdit(engine.doc, tokens, (edits) =>
        items.map((item) => {
          const created = edits.createVariable({
            collectionId: collectionFor(edits, item),
            name: stringArg(item, "name"),
            type: "color",
            value: { color: "#000000FF" },
            description: optionalString(item, "description") ?? "",
          });
          writeColorValues(edits, created.id, item);
          return created.id;
        }),
      );
      const store = tokens.store();
      return ids.flatMap((id) => {
        const v = store.variable(id);
        return v ? [describeVariable(store, v, 0)] : [];
      });
    },
  },
  {
    name: "update_board_colors",
    description:
      "Changes board colors: their name (slashes group it), description, values per mode or " +
      "the color they follow. Shapes using them follow.",
    inputSchema: {
      type: "object",
      required: ["colors"],
      properties: {
        colors: {
          type: "array",
          items: {
            type: "object",
            required: ["color"],
            properties: {
              color: { type: "string", description: "The color's id or name." },
              name: { type: "string" },
              description: { type: "string" },
              ...COLOR_VALUE_FIELDS,
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const items = recordList(args, "colors");
      const ids = checkedTokenEdit(engine.doc, tokens, (edits) =>
        items.map((item) => {
          const variable = requireColor(edits, stringArg(item, "color"));
          const name = optionalString(item, "name");
          const description = optionalString(item, "description");
          if (name !== undefined || description !== undefined) {
            edits.updateVariable(variable.id, { name, description });
          }
          writeColorValues(edits, variable.id, item);
          return variable.id;
        }),
      );
      const store = tokens.store();
      return ids.flatMap((id) => {
        const v = store.variable(id);
        return v ? [describeVariable(store, v, tokens.usageOf(id).layers.length)] : [];
      });
    },
  },
  {
    name: "delete_board_colors",
    description:
      "Deletes board colors. Shapes using them keep their color, unlinked; colors following one " +
      "keep its color as their own.",
    inputSchema: {
      type: "object",
      required: ["colors"],
      properties: { colors: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const ids = stringList(args, "colors").map((ref) => requireColor(tokens, ref).id);
      const unlinked = ids.reduce((n, id) => n + tokens.usageOf(id).layers.length, 0);
      asUndoStep(engine.doc, () => tokens.deleteVariables(ids));
      return { deleted: ids.length, shapesUnlinked: unlinked };
    },
  },
  {
    name: "create_board_color_collection",
    description: "Adds a collection (a folder of board colors).",
    inputSchema: { type: "object", required: ["name"], properties: { name: { type: "string" } } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const tokens = engine.service(DOCUMENT_TOKENS);
      const name = stringArg(args, "name");
      if (
        tokens
          .store()
          .collections()
          .some((c) => c.name === name)
      ) {
        return requireCollection(tokens.store(), name, LIST_TOOL);
      }
      return asUndoStep(engine.doc, () => tokens.createCollection(name));
    },
  },
];
