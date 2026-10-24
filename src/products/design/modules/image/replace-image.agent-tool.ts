import { asUndoStep, imageSize, optionalNumber, stringArg } from "@canvas";
import { createId } from "@shared/core";

import { requireDesign, type DesignAgentTool } from "../../agent";
import { isDesignNode } from "../core";
import { firstImageFill, replaceImageFill } from "./replace-image-fill";

/** Another picture in a layer's image fill, keeping how the fill places it. */
export const replaceImageTool: DesignAgentTool = {
  name: "replace_image",
  description:
    "Puts a picture file (PNG, JPG, GIF, WebP, SVG, …) in a layer's image fill instead of its " +
    "picture, keeping how the fill places it (fill, fit, crop, tile, turn, opacity), in one undo " +
    "step, as Replace in the Catalog's page pictures does. `fill` is the fill's index among the " +
    "layer's fills (get_brochure_page and get_nodes list them; default: its first image fill). " +
    "The layer may be on any page. Returns the picture's assetId and pixel size.",
  inputSchema: {
    type: "object",
    required: ["node", "path"],
    properties: {
      node: { type: "string", description: "The layer's id." },
      path: { type: "string", description: "Absolute path of the picture." },
      fill: { type: "number", description: "The image fill's index among the layer's fills." },
    },
  },
  run: async (host, args) => {
    const { engine } = requireDesign(host);
    const id = stringArg(args, "node");
    const node = engine.doc.get(id);
    if (!node || !isDesignNode(node)) throw new Error(`No layer with id ${id}.`);
    const fill = optionalNumber(args, "fill") ?? firstImageFill(node);
    if (fill < 0) throw new Error(`“${node.name}” has no image fill (add one with update_nodes).`);
    const path = stringArg(args, "path");
    const data = await host.readFile(path);
    const size = await imageSize(data);
    if (!size) throw new Error(`${path} isn't a picture the app can read.`);
    const index = Math.round(fill);
    const assetId = createId();
    // Throws for a fill that isn't an image, before the picture is stored.
    const patch = replaceImageFill(node, index, assetId);
    // Assets are outside the undo history, as when pasting.
    engine.doc.addAsset(assetId, data);
    asUndoStep(engine.doc, () => engine.doc.update(node.id, patch));
    return { node: node.id, fill: index, assetId, ...size };
  },
};
