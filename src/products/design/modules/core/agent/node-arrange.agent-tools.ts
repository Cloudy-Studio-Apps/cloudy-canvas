import { optionalBoolean, optionalChoice, stringList, type ReorderDirection } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../../agent";

const DIRECTIONS: readonly ReorderDirection[] = ["front", "forward", "backward", "back"];
const IDS_SCHEMA = { type: "array", items: { type: "string" } };

export const nodeArrangeTools: DesignAgentTool[] = [
  {
    name: "reorder_nodes",
    description:
      "Moves layers in the drawing order as one undo step, as ] and [ do: to the front or back, " +
      "or one step forward or backward past the nearest layer they overlap. Layers stay in their " +
      "parent (a frame draws what it holds above itself). Returns the ids whose order changed.",
    inputSchema: {
      type: "object",
      required: ["ids", "direction"],
      properties: { ids: IDS_SCHEMA, direction: { enum: DIRECTIONS } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const direction = optionalChoice(args, "direction", DIRECTIONS);
      if (!direction) throw new Error(`"direction" must be one of: ${DIRECTIONS.join(", ")}.`);
      return { reordered: engine.reorderElements(ids, direction) };
    },
  },
  {
    name: "lock_nodes",
    description:
      "Locks layers (with what they hold) in place as one undo step, or unlocks them with " +
      "locked: false. The user can't select or drag locked layers on the canvas until they're " +
      "unlocked. Returns the ids that changed.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: IDS_SCHEMA,
        locked: { type: "boolean", description: "false unlocks (true by default)." },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const locked = optionalBoolean(args, "locked") ?? true;
      return { changed: engine.setLocked(engine.withMembers(ids, "move"), locked) };
    },
  },
];
