import { optionalBoolean, recordList, type RulerGuide, type ToolArgs } from "@canvas";

import { requireDesign, type DesignAgentTool } from "../../agent";

/** A guide an agent gave, checked. */
function readGuide(args: ToolArgs): RulerGuide {
  const { axis, value } = args;
  if (axis !== "x" && axis !== "y") throw new Error('A guide\'s `axis` is "x" or "y".');
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("A guide's `value` must be a number.");
  return { axis, value: Math.round(value * 100) / 100 };
}

/** Indexes an agent gave, checked against the page's guides. */
function readIndexes(args: ToolArgs, count: number): number[] {
  const indexes = args.indexes;
  if (!Array.isArray(indexes) || indexes.length === 0)
    throw new Error("Give `indexes` (from list_guides) or `all: true`.");
  return indexes.map((index) => {
    if (typeof index !== "number" || !Number.isInteger(index) || index < 0 || index >= count)
      throw new Error(`No guide at index ${String(index)}. Call list_guides for them.`);
    return index;
  });
}

/** The current page's ruler guides, as the rulers make them. */
export const guidesTools: DesignAgentTool[] = [
  {
    name: "list_guides",
    description:
      "Lists the ruler guides of the page on screen, by index: `axis` x is a vertical line at " +
      "x = `value`, y a horizontal one at y = `value` (world units). Layers snap to them when " +
      "they're moved, resized or drawn.",
    inputSchema: { type: "object", properties: {} },
    run: (host) => {
      const { engine } = requireDesign(host);
      return { guides: engine.guides().map((guide, index) => ({ index, ...guide })) };
    },
  },
  {
    name: "add_guides",
    description: "Adds ruler guides to the page on screen, in one undo step.",
    inputSchema: {
      type: "object",
      required: ["guides"],
      properties: {
        guides: {
          type: "array",
          items: {
            type: "object",
            required: ["axis", "value"],
            properties: {
              axis: {
                type: "string",
                enum: ["x", "y"],
                description: "x: vertical, y: horizontal.",
              },
              value: { type: "number" },
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const guides = recordList(args, "guides").map(readGuide);
      engine.addGuides(guides);
      return { guides: engine.guides().length };
    },
  },
  {
    name: "remove_guides",
    description:
      "Removes ruler guides of the page on screen by their index (list_guides), or all of them " +
      "with `all: true`, in one undo step.",
    inputSchema: {
      type: "object",
      properties: {
        indexes: { type: "array", items: { type: "integer" } },
        all: { type: "boolean" },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const count = engine.guides().length;
      engine.removeGuides(optionalBoolean(args, "all") ? undefined : readIndexes(args, count));
      return { removed: count - engine.guides().length };
    },
  },
];
