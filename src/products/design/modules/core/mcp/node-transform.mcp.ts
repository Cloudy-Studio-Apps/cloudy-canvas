import { optionalChoice, optionalNumber, stringList, type RotatePivot } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../../mcp";
import type { FlipAxis } from "../node";
import { flipNodes } from "../transform";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };
const PIVOTS: readonly RotatePivot[] = ["selection", "each"];
const DIRECTIONS = ["horizontal", "vertical"] as const;

/** Turning and mirroring layers, as the panel's rotation row does. */
export const nodeTransformTools: DesignMcpTool[] = [
  {
    name: "rotate_nodes",
    description:
      "Turns layers (with what they hold) by some degrees, counterclockwise, as one undo step: " +
      'round the middle of them all (around: "selection", the default) or each round its own ' +
      'middle ("each"). Lines turn their ends; a group turns its layers. Returns the turned ids; ' +
      "get_nodes shows each one's rotation (round its top-left corner).",
    inputSchema: {
      type: "object",
      required: ["ids", "degrees"],
      properties: {
        ids: IDS_SCHEMA,
        degrees: { type: "number", description: "Counterclockwise; negative turns clockwise." },
        around: { enum: PIVOTS },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "ids"));
      const degrees = optionalNumber(args, "degrees");
      if (degrees === undefined || !Number.isFinite(degrees))
        throw new Error('"degrees" must be a number.');
      const around = optionalChoice(args, "around", PIVOTS) ?? "selection";
      return { rotated: engine.rotateElements(ids, degrees, around) };
    },
  },
  {
    name: "flip_nodes",
    description:
      "Mirrors layers (with what they hold) across the middle of them all, as Shift+H and " +
      "Shift+V do, as one undo step: vectors and lines mirror their points, shapes land mirrored " +
      "and turned the other way; texts and layers showing pictures are drawn mirrored (`mirrored`). " +
      "Returns the flipped ids.",
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
      const axis: FlipAxis = direction === "horizontal" ? "x" : "y";
      return { flipped: flipNodes(engine, ids, axis) };
    },
  },
];
