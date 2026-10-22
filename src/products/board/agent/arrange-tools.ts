import {
  arrangeTools as canvasArrangeTools,
  optionalBoolean,
  optionalChoice,
  stringList,
  type ReorderDirection,
} from "@canvas";

import { requireBoard, requireShapes } from "./board-access";
import type { AgentHost, BoardAgentTool } from "./board-agent.types";

const DIRECTIONS: readonly ReorderDirection[] = ["front", "forward", "backward", "back"];
const IDS_SCHEMA = { type: "array", items: { type: "string" } };

export const arrangeTools: BoardAgentTool[] = [
  {
    name: "reorder_shapes",
    description:
      "Moves shapes (with what moves with them) in the drawing order as one undo step, as the " +
      "context menu does: to the front or back of everything, or one step forward or backward " +
      "past the nearest shape they overlap. Sections keep their own order (larger behind smaller). " +
      "Returns the ids whose order changed.",
    inputSchema: {
      type: "object",
      required: ["ids", "direction"],
      properties: { ids: IDS_SCHEMA, direction: { enum: DIRECTIONS } },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = requireShapes(engine, stringList(args, "ids"));
      const direction = optionalChoice(args, "direction", DIRECTIONS);
      if (!direction) throw new Error(`"direction" must be one of: ${DIRECTIONS.join(", ")}.`);
      return { reordered: engine.reorderElements(ids, direction) };
    },
  },
  {
    name: "lock_shapes",
    description:
      "Locks shapes (with what moves with them) in place as one undo step, or unlocks them with " +
      "locked: false. The user can't select or drag locked shapes until they're unlocked; " +
      "list_shapes marks them locked (unlock them all by passing those ids). Returns the ids " +
      "that changed.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: IDS_SCHEMA,
        locked: { type: "boolean", description: "false unlocks (true by default)." },
      },
    },
    run: (host, args) => {
      const { engine } = requireBoard(host);
      const ids = requireShapes(engine, stringList(args, "ids"));
      const locked = optionalBoolean(args, "locked") ?? true;
      return { changed: engine.setLocked(engine.withMembers(ids, "move"), locked) };
    },
  },
  ...canvasArrangeTools<AgentHost>({
    noun: "shapes",
    things: "shapes",
    holder: "the section it's in",
    resolve: (host, ids) => {
      const { engine } = requireBoard(host);
      return { engine, ids: requireShapes(engine, ids) };
    },
  }),
];
