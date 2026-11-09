import { asUndoStep, recordList, stringArg, stringList } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../../mcp";
import { DESIGN_PROTOTYPE, screenOf, writeInteractions } from "../model";
import { readInteractionArgs } from "./interaction-args";

const INTERACTION_DESCRIPTION =
  "A screen is a top-level frame of a design page; a layer (or a screen itself) gets " +
  "interactions that play in the prototype. Each has: `trigger` (click, hover, press, enter, " +
  'leave, drag, key with its `key` such as "Enter", or delay with `delay` in ms, 0-60000); ' +
  "`action`: navigate (show screen `to`), overlay (open screen `to` over the current one), " +
  "swap (replace the open overlay with screen `to`), back (go back), close (close the top " +
  "overlay) or link (open `url`, http: or https: only); `transition` { animation: instant, " +
  "dissolve, move-in, move-out, push, slide-in or slide-out (default dissolve); direction: " +
  "left, right, up or down, where things move, so `left` means the new screen comes in from " +
  "the right (default left); duration in ms, 0-5000 (default 300); easing: linear, ease-in, " +
  "ease-out, ease-in-out or spring (default ease-out) }, and for overlay and swap `overlay` " +
  "{ position: top, center or bottom; closeOutside: a click outside closes it; dim: dim the " +
  "screen behind }. `to` must be a screen on the layer's design page other than the one the " +
  "layer is on.";

/** Reading and replacing the interactions of layers and screens. */
export const interactionTools: DesignMcpTool[] = [
  {
    name: "get_interactions",
    description:
      "The prototype interactions of layers or screens (set_interactions, list_flows). " +
      INTERACTION_DESCRIPTION,
    inputSchema: {
      type: "object",
      required: ["nodes"],
      properties: { nodes: { type: "array", items: { type: "string" } } },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = requireNodes(engine, stringList(args, "nodes"));
      const prototype = engine.service(DESIGN_PROTOTYPE);
      return {
        nodes: ids.map((node) => ({
          node,
          screen: screenOf(engine.doc, node)?.id ?? null,
          interactions: prototype.interactions(node),
        })),
      };
    },
  },
  {
    name: "set_interactions",
    description:
      "Replaces a layer's (or screen's) interactions with `interactions` (an empty list clears " +
      "them), in one undo step. Everything is checked before anything is written; the first " +
      "problem is reported with its index and field. Entries need no `id` (one is made; an id " +
      "you give is kept when it's unique in the list). " +
      INTERACTION_DESCRIPTION,
    inputSchema: {
      type: "object",
      required: ["node", "interactions"],
      properties: {
        node: { type: "string", description: "The id of a layer or screen." },
        interactions: {
          type: "array",
          items: {
            type: "object",
            required: ["trigger", "action"],
            properties: {
              trigger: { type: "string" },
              key: { type: "string" },
              delay: { type: "number" },
              action: { type: "string" },
              to: { type: "string" },
              url: { type: "string" },
              transition: { type: "object" },
              overlay: { type: "object" },
            },
          },
        },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const [node] = requireNodes(engine, [stringArg(args, "node")]);
      if (node === undefined) throw new Error('Give "node".');
      if (!screenOf(engine.doc, node)) {
        throw new Error(`The layer ${node} isn't on a screen (a top-level frame).`);
      }
      const list = readInteractionArgs(engine.doc, node, recordList(args, "interactions"));
      asUndoStep(engine.doc, () => writeInteractions(engine.doc, node, list));
      return { node, interactions: list };
    },
  },
];
