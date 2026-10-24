import { asUndoStep, optionalNumber, optionalString, stringList, type Rect } from "@canvas";

import { requireDesign, requireNodes, type DesignAgentTool } from "../../agent";
import { checkParent, containerAt, isNodeKind, type DesignNode } from "../core";
import { createRectangle, type RectangleElement } from "../rectangle";
import {
  addPlaceholderPaint,
  canHoldPlaceholder,
  DEFAULT_PLACEHOLDER_COLOR,
  placeholderPatches,
} from "./placeholder";

const HEX = /^#?[0-9a-f]{6}$/i;

/** Placeholders for pictures not chosen yet, which the Catalog lists to replace. */
export const imagePlaceholderTool: DesignAgentTool = {
  name: "add_image_placeholder",
  description:
    "Marks where a picture goes when you don't have it yet (catalog and brochure pages, " +
    "mockups): an image fill showing the layer's color with the foca watona and a “?” in the " +
    "middle. Use it instead of a plain gray rectangle: the Catalog mode lists placeholders as " +
    "pictures to replace (get_brochure reports them as `placeholder` issues) and the user swaps " +
    "them with Replace, or you with replace_image. With `ids`, those layers' fills become one " +
    "placeholder of their own solid fill's color (or `color`), keeping their size and place; " +
    'without, it adds a rectangle named "Image placeholder" at x, y, w, h (default 400 × 300) ' +
    "in the frame under its center unless `parent` says where. One undo step. Returns the " +
    "layers' ids and their placeholder assetIds.",
  inputSchema: {
    type: "object",
    properties: {
      ids: {
        type: "array",
        items: { type: "string" },
        description: "Layers to turn into placeholders (any that take fills).",
      },
      x: { type: "number" },
      y: { type: "number" },
      w: { type: "number" },
      h: { type: "number" },
      name: { type: "string" },
      parent: {
        type: ["string", "null"],
        description: "Frame or section to put a new one in; null for the top of the page.",
      },
      color: {
        type: "string",
        description: `#RRGGBB background (default: the layer's fill, else ${DEFAULT_PLACEHOLDER_COLOR}).`,
      },
    },
  },
  run: (host, args) => {
    const { engine } = requireDesign(host);
    const color = optionalString(args, "color");
    if (color !== undefined && !HEX.test(color)) throw new Error('"color" must be #RRGGBB.');
    const hex = color && (color.startsWith("#") ? color : `#${color}`);

    if (args.ids !== undefined) {
      const nodes = requireNodes(engine, stringList(args, "ids")).flatMap(
        (id) => engine.getElement(id) ?? [],
      );
      const refused = nodes.find((node) => !canHoldPlaceholder(node, engine.kinds));
      if (refused) throw new Error(`Layer ${refused.id} takes no fills or is locked.`);
      const patches = placeholderPatches(engine.doc, engine.kinds, nodes, hex);
      asUndoStep(engine.doc, () => engine.doc.updateMany(patches));
      return {
        placeholders: [...patches.keys()].map((id) => {
          const [paint] = (engine.doc.get(id) as DesignNode | undefined)?.fills ?? [];
          return { id, assetId: paint?.type === "image" ? paint.assetId : null };
        }),
      };
    }

    const rect = placeholderRect(args);
    const paint = addPlaceholderPaint(engine.doc, hex ?? DEFAULT_PLACEHOLDER_COLOR, rect);
    const name = optionalString(args, "name") ?? "Image placeholder";
    const node = createRectangle(rect, name, engine.doc.nextIndex(), null, [paint]);
    const kind = engine.kinds.kindOf(node);
    const context = { kinds: engine.kinds, lookup: (ref: string) => engine.getElement(ref) };
    const parentId =
      "parent" in args && isNodeKind(kind)
        ? checkParent(node, args.parent, context)
        : (containerAt(node, engine.elements(), engine.kinds)?.id ?? null);
    const placed: RectangleElement = { ...node, parentId };
    asUndoStep(engine.doc, () => engine.doc.add(placed));
    return { placeholders: [{ id: node.id, assetId: paint.assetId }], parentId, ...rect };
  },
};

function placeholderRect(args: Record<string, unknown>): Rect {
  const w = optionalNumber(args, "w") ?? 400;
  const h = optionalNumber(args, "h") ?? 300;
  if (w <= 0 || h <= 0) throw new Error('"w" and "h" must be more than 0.');
  return {
    x: optionalNumber(args, "x") ?? 0,
    y: optionalNumber(args, "y") ?? 0,
    w: Math.round(w),
    h: Math.round(h),
  };
}
