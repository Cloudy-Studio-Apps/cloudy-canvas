import type { Alignment } from "../arrange";
import type { AgentTool } from "./agent-tool.types";
import type { ArrangeToolsOptions } from "./arrange-tools.types";
import { optionalChoice, stringList } from "./tool-args";

const ALIGNMENTS: readonly Alignment[] = ["left", "centerX", "right", "top", "centerY", "bottom"];
const AXES = ["horizontal", "vertical"] as const;
const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/**
 * The tools that align, distribute and tidy up elements as the context menu does, each one undo
 * step, with what moves with them; they take ids and leave the selection alone.
 */
export function arrangeTools<H>({
  noun,
  things,
  holder,
  resolve,
}: ArrangeToolsOptions<H>): AgentTool<H>[] {
  return [
    {
      name: `align_${noun}`,
      description:
        `Lines ${things} up on an edge or center as one undo step, as Alt+A/D/W/S/H/V do: ` +
        `several ${things} with each other (left: all move to the leftmost left edge, centerX: ` +
        `to the middle of their bounds, …), or a single one with ${holder}. Nothing changes ` +
        `parent. Returns the moved ids.`,
      inputSchema: {
        type: "object",
        required: ["ids", "alignment"],
        properties: { ids: IDS_SCHEMA, alignment: { enum: ALIGNMENTS } },
      },
      run: (host, args) => {
        const { engine, ids } = resolve(host, stringList(args, "ids"));
        const alignment = optionalChoice(args, "alignment", ALIGNMENTS);
        if (!alignment) throw new Error(`"alignment" must be one of: ${ALIGNMENTS.join(", ")}.`);
        if (!engine.canAlign(ids))
          throw new Error(`Give two or more unlocked ${things}, or one inside ${holder}.`);
        return { moved: engine.alignElements(ids, alignment) };
      },
    },
    {
      name: `distribute_${noun}`,
      description:
        `Spaces three or more ${things} out evenly as one undo step, as Alt+Shift+H/V do: ` +
        `ordered by position, the first and last stay put and the spaces between neighbors ` +
        `become equal. Returns the moved ids.`,
      inputSchema: {
        type: "object",
        required: ["ids", "axis"],
        properties: { ids: IDS_SCHEMA, axis: { enum: AXES } },
      },
      run: (host, args) => {
        const { engine, ids } = resolve(host, stringList(args, "ids"));
        const axis = optionalChoice(args, "axis", AXES);
        if (!axis) throw new Error(`"axis" must be one of: ${AXES.join(", ")}.`);
        if (ids.length < 3) throw new Error(`Give three or more ${things} to distribute.`);
        return { moved: engine.distributeElements(ids, axis === "horizontal" ? "x" : "y") };
      },
    },
    {
      name: `tidy_up_${noun}`,
      description:
        `Tidies a rough arrangement of ${things} into a grid as one undo step, as Tidy up ` +
        `(Alt+Shift+T) does: rows of columns from their top-left corner, with the median space ` +
        `between neighbors. Returns the moved ids.`,
      inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
      run: (host, args) => {
        const { engine, ids } = resolve(host, stringList(args, "ids"));
        if (ids.length < 2) throw new Error(`Give two or more ${things} to tidy up.`);
        return { moved: engine.tidyUpElements(ids) };
      },
    },
  ];
}
