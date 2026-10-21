import {
  agentPatches,
  asUndoStep,
  optionalBoolean,
  optionalNumber,
  recordList,
  stringArg,
  stringList,
} from "@canvas";

import { requireBoard } from "./board-access";
import type { BoardAgentTool } from "./board-agent.types";
import { createShapesTool } from "./create-shapes-tool";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

export const shapeEditTools: BoardAgentTool[] = [
  createShapesTool,
  {
    name: "update_shapes",
    description:
      "Changes fields of existing shapes as one undo step, e.g. { id, patch: { x, y, text, color } }. " +
      "Field names are the ones get_shapes returns; an error lists what a type allows. Moving a " +
      "section, an ER entity or an aggregation moves what's in it. A new w/h resizes as the handles " +
      "do (images, stickers and links keep their proportions; tables scale their rows and columns). " +
      "Connectors take from/to like create_shapes to re-attach an end; tables take fills (cell " +
      'colors, one array per row, "" for none); images take background (none, white) and padding; ' +
      "strokes take color and size; links take url. Database tables, enums and ER elements can " +
      "only be moved (edit them as DBML or ER text).",
    inputSchema: {
      type: "object",
      required: ["updates"],
      properties: {
        updates: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "patch"],
            properties: { id: { type: "string" }, patch: { type: "object" } },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const updates = recordList(args, "updates").map((update) => {
        const id = stringArg(update, "id");
        const patch = update.patch;
        if (typeof patch !== "object" || patch === null || Array.isArray(patch)) {
          throw new Error(`"patch" for ${id} must be an object.`);
        }
        return { id, patch: patch as Record<string, unknown> };
      });
      const patches = agentPatches(engine, updates);
      asUndoStep(engine.doc, () => engine.doc.updateMany(patches));
      return { updated: [...patches.keys()] };
    },
  },
  {
    name: "delete_shapes",
    description:
      "Deletes shapes as one undo step. A section takes the shapes inside it; connectors " +
      "attached to deleted shapes stay with a free end.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      return { deleted: engine.deleteElements(stringList(args, "ids")) };
    },
  },
  {
    name: "duplicate_shapes",
    description:
      "Copies shapes as one undo step, as Ctrl+D does: what moves with them is copied too (a " +
      "section's contents, an entity's attributes), copied database tables get free names, copied " +
      "ER elements form a new diagram, and connectors keep only the ends whose shape was copied. " +
      "Returns each id's copy. The copies are offset by dx/dy (20 by default).",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: IDS_SCHEMA, dx: { type: "number" }, dy: { type: "number" } },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = stringList(args, "ids");
      const missing = ids.find((id) => !engine.getElement(id));
      if (missing) throw new Error(`No shape with id ${missing}.`);
      const dx = optionalNumber(args, "dx");
      const dy = optionalNumber(args, "dy");
      const offset = dx === undefined && dy === undefined ? undefined : { x: dx ?? 0, y: dy ?? 0 };
      return { copies: Object.fromEntries(engine.duplicateElements(ids, offset)) };
    },
  },
  {
    name: "select_shapes",
    description:
      "Selects shapes in the editor, e.g. to show the user what changed. Empty clears it.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: IDS_SCHEMA,
        zoom: { type: "boolean", description: "Fit the view to the shape when selecting one." },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = stringList(args, "ids").filter((id) => engine.getElement(id));
      const [first] = ids;
      if (optionalBoolean(args, "zoom") && first && ids.length === 1) engine.zoomToElement(first);
      else engine.select(ids);
      return { selected: engine.selectedIds() };
    },
  },
];
