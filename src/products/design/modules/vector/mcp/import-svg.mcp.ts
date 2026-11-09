import {
  asUndoStep,
  isSvg,
  optionalNumber,
  optionalString,
  readSvg,
  stringArg,
  type Rect,
} from "@canvas";

import { requireDesign, type DesignMcpTool } from "../../../mcp";
import { checkParent, containerAt, isNodeKind } from "../../core";
import type { VectorElement } from "../vector.types";
import { svgSize, svgToVectorIn } from "../svg";

/** Placing an SVG file as one vector, as dropping it on the canvas does. */
export const importSvgTool: DesignMcpTool = {
  name: "svg_import",
  description:
    "Places an SVG file as one vector, as dropping it does, in one undo step: each shape of the " +
    "file is an area of the vector with its own fill (a stroke becomes the area it covers), " +
    "recolored through network.regions[i].fills. It's at the file's size unless w and/or h are " +
    "given (one keeps the proportions), and goes into the frame under its center unless " +
    "`parent` says where. Text, embedded pictures and <use> in the file are left out. To place " +
    "it as a picture instead, use image_add. Returns the vector's id and how many areas it has.",
  inputSchema: {
    type: "object",
    required: ["path"],
    properties: {
      path: { type: "string", description: "Absolute path of the .svg file." },
      x: { type: "number" },
      y: { type: "number" },
      w: { type: "number" },
      h: { type: "number" },
      name: { type: "string" },
      parent: {
        type: ["string", "null"],
        description: "Frame or section to put it in; null for the top of the page.",
      },
    },
  },
  run: async (host, args) => {
    const { engine } = requireDesign(host);
    const path = stringArg(args, "path");
    const data = await host.readFile(path);
    const svg = isSvg(data) ? readSvg(new TextDecoder().decode(data)) : null;
    if (!svg || svg.layers.length === 0) throw new Error(`${path} isn't an SVG with shapes.`);
    const name = optionalString(args, "name") ?? "Vector";
    const vector = svgToVectorIn(svg, svgRect(args, svgSize(svg)), engine.doc.nextIndex(), name);
    if (!vector) throw new Error(`${path} draws nothing the app can turn into a vector.`);
    const kind = engine.kinds.kindOf(vector);
    const context = { kinds: engine.kinds, lookup: (ref: string) => engine.getElement(ref) };
    const parentId =
      "parent" in args && isNodeKind(kind)
        ? checkParent(vector, args.parent, context)
        : (containerAt(vector, engine.elements(), engine.kinds)?.id ?? null);
    const placed: VectorElement = { ...vector, parentId };
    asUndoStep(engine.doc, () => engine.doc.add(placed));
    return {
      id: placed.id,
      parentId,
      areas: placed.network.regions.length,
      x: placed.x,
      y: placed.y,
      w: placed.w,
      h: placed.h,
    };
  },
};

/** Where the file goes: its size at x, y, or `w`/`h` with the other side in proportion. */
function svgRect(args: Record<string, unknown>, size: { w: number; h: number }): Rect {
  const w = optionalNumber(args, "w");
  const h = optionalNumber(args, "h");
  if ((w !== undefined && w <= 0) || (h !== undefined && h <= 0)) {
    throw new Error('"w" and "h" must be more than 0.');
  }
  const width = w ?? (h !== undefined ? (h * size.w) / size.h : size.w);
  const height = (width * size.h) / size.w;
  return {
    x: optionalNumber(args, "x") ?? 0,
    y: optionalNumber(args, "y") ?? 0,
    w: width,
    h: height,
  };
}
