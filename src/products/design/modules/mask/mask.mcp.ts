import { asUndoStep, optionalBoolean, stringList } from "@canvas";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../mcp";
import { maskType } from "../core";
import { maskNodes, releaseMasks } from "./mask-edits";

const IDS_SCHEMA = { type: "array", items: { type: "string" } };

/** Masks, as "Use as mask" (Ctrl+Alt+M) and "Release mask" do. */
export const maskTools: DesignMcpTool[] = [
  {
    name: "mask_nodes",
    description:
      "Masks layers, as Figma's Use as mask (Ctrl+Alt+M), in one undo step. With several ids " +
      'they go into a new "Mask group" whose bottom-most layer becomes the mask: the layers ' +
      "above it show only through it, and the mask itself isn't drawn. With one id, that layer " +
      "becomes a mask of the layers above it in its parent. `type`: how it masks, by its opacity " +
      "(alpha, default), its outline alone (vector) or its brightness (luminance); `inverted`: " +
      "show what's outside the mask instead (a cut-out). Returns the mask group or the mask.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: IDS_SCHEMA,
        type: { type: "string", enum: ["alpha", "vector", "luminance"] },
        inverted: { type: "boolean" },
      },
    },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const type = args.type === undefined ? "alpha" : maskType(args.type, "type");
      const inverted = optionalBoolean(args, "inverted") ?? false;
      const result = asUndoStep(engine.doc, () =>
        maskNodes(engine.doc, ids, engine.elements(), engine.kinds, { type, inverted }),
      );
      const [id] = result;
      if (!id) throw new Error("Nothing to mask.");
      return ids.size > 1 ? { maskGroup: id } : { mask: id };
    },
  },
  {
    name: "release_masks",
    description:
      "Turns masks back into ordinary, drawn layers, in one undo step: the given masks, or the " +
      "masks right inside the given layers (a mask group's). The layers they masked show whole. " +
      "Returns the released masks.",
    inputSchema: { type: "object", required: ["ids"], properties: { ids: IDS_SCHEMA } },
    run: (host, args) => {
      const { engine } = requireDesign(host);
      const ids = new Set(requireNodes(engine, stringList(args, "ids")));
      const released = asUndoStep(engine.doc, () =>
        releaseMasks(engine.doc, ids, engine.elements()),
      );
      if (released.length === 0) throw new Error("None of these layers is or holds a mask.");
      return { released };
    },
  },
];
