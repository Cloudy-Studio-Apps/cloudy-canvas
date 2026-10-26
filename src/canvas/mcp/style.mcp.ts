import type { McpTool } from "./mcp-tool.types";
import type { ArrangeToolsOptions } from "./arrange.mcp.types";
import { optionalString, stringList } from "./tool-args";

/**
 * `copy_properties_to_<noun>`: Copy and Paste properties (Ctrl+Alt+C, Ctrl+Alt+V) for agents.
 * Gives elements the look of another (its fills, colors, font…), as one undo step, without
 * touching what the user copied.
 */
export function copyPropertiesTool<H>({
  noun,
  things,
  resolve,
}: ArrangeToolsOptions<H>): McpTool<H> {
  return {
    name: `copy_properties_to_${noun}`,
    description:
      `Gives ${things} the look of another as one undo step, as Copy and Paste properties ` +
      `(Ctrl+Alt+C, Ctrl+Alt+V) do: the style fields of "from" (fills, strokes, colors, ` +
      `opacity, corner radius, font…) that each target has too, matched by name across types. ` +
      `Locked ones stay as they are. Returns the changed ids.`,
    inputSchema: {
      type: "object",
      required: ["from", "ids"],
      properties: {
        from: { type: "string", description: "The id whose look is copied." },
        ids: { type: "array", items: { type: "string" } },
      },
    },
    run: (host, args) => {
      const from = optionalString(args, "from");
      if (!from) throw new Error('Give "from", the id whose look is copied.');
      const { engine, ids } = resolve(host, [from, ...stringList(args, "ids")]);
      return { changed: engine.applyStyleOf(from, ids.slice(1)) };
    },
  };
}
