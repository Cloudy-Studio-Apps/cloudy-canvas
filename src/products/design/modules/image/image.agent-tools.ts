import {
  asUndoStep,
  imageSize,
  optionalChoice,
  optionalNumber,
  optionalString,
  stringArg,
  type Rect,
} from "@canvas";
import { createId } from "@shared/core";

import { requireDesign, type DesignAgentTool } from "../../agent";
import { checkParent, containerAt, imagePaint, isNodeKind, type ImageScaleMode } from "../core";
import { createRectangle, type RectangleElement } from "../rectangle";

const SCALE_MODES: readonly ImageScaleMode[] = ["fill", "fit"];

/** Placing picture files, as dropping them on the canvas does. */
export const imageTools: DesignAgentTool[] = [
  {
    name: "add_image",
    description:
      'Places a picture file (PNG, JPG, GIF, WebP, SVG, …) as a rectangle named "Image" filled ' +
      "with it, as dropping the file does, in one undo step. It's at its pixel size unless w " +
      "and/or h are given (one keeps the proportions), and goes into the frame under its center " +
      "unless `parent` says where. Returns the layer's id and the image's assetId, which other " +
      'layers can use in an image paint ({ type: "image", assetId }).',
    inputSchema: {
      type: "object",
      required: ["path"],
      properties: {
        path: { type: "string", description: "Absolute path of the picture." },
        x: { type: "number" },
        y: { type: "number" },
        w: { type: "number" },
        h: { type: "number" },
        name: { type: "string" },
        parent: {
          type: ["string", "null"],
          description: "Frame or section to put it in; null for the top of the page.",
        },
        scaleMode: {
          enum: SCALE_MODES,
          description: "fill crops to cover (default), fit shows it all.",
        },
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const path = stringArg(args, "path");
      const data = await host.readFile(path);
      const size = await imageSize(data);
      if (!size) throw new Error(`${path} isn't a picture the app can read.`);
      const rect = imageRect(args, size.width, size.height);
      const assetId = createId();
      const scaleMode = optionalChoice(args, "scaleMode", SCALE_MODES) ?? "fill";
      const name = optionalString(args, "name") ?? "Image";
      const index = engine.doc.nextIndex();
      const node = createRectangle(rect, name, index, null, [imagePaint(assetId, scaleMode)]);
      const kind = engine.kinds.kindOf(node);
      const context = { kinds: engine.kinds, lookup: (ref: string) => engine.getElement(ref) };
      const parentId =
        "parent" in args && isNodeKind(kind)
          ? checkParent(node, kind, args.parent, context)
          : (containerAt(node, engine.elements(), engine.kinds)?.id ?? null);
      // Assets are outside the undo history, as when pasting.
      engine.doc.addAsset(assetId, data);
      const placed: RectangleElement = { ...node, parentId };
      asUndoStep(engine.doc, () => engine.doc.add(placed));
      return { id: node.id, assetId, parentId, ...rect };
    },
  },
];

/** The picture's bounds: its pixel size, or `w`/`h` with the other side in proportion. */
function imageRect(args: Record<string, unknown>, width: number, height: number): Rect {
  const w = optionalNumber(args, "w");
  const h = optionalNumber(args, "h");
  if ((w !== undefined && w <= 0) || (h !== undefined && h <= 0)) {
    throw new Error('"w" and "h" must be more than 0.');
  }
  return {
    x: optionalNumber(args, "x") ?? 0,
    y: optionalNumber(args, "y") ?? 0,
    w: Math.round(w ?? (h !== undefined ? (h * width) / height : width)),
    h: Math.round(h ?? (w !== undefined ? (w * height) / width : height)),
  };
}
