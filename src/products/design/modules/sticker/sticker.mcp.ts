import {
  asUndoStep,
  optionalNumber,
  recordList,
  stringArg,
  stringList,
  type ToolArgs,
} from "@canvas";
import { findStampableSticker, pickSticker } from "@shared/core";

import { requireDesign, requireNodes, type DesignMcpTool } from "../../mcp";
import { checkParent, containerAt } from "../core";
import { readEdgeColor, readStickerOutline } from "./sticker-args";
import { STICKER_NODE_DEFAULTS } from "./sticker.defaults";
import { stickerEdgePatches } from "./sticker-edge";
import { createStickerNode, stickerRect } from "./sticker.factory";
import { stickerToVectors } from "./sticker-to-vectors";
import type { StickerNodeElement } from "./sticker.types";

const OUTLINE_SCHEMA = {
  type: ["object", "null"],
  description:
    "A border following the sticker's shape: { color: #RRGGBB, width, visible }; null removes it.",
  properties: {
    color: { type: "string" },
    width: { type: "number" },
    visible: { type: "boolean" },
  },
};
const EDGE_SCHEMA = {
  type: ["string", "null"],
  description:
    "The die-cut edge's color (#RRGGBB) of seal, common and plugin art stickers; null for white.",
};

/** Stamping stickers on designs, restyling them and turning them into vectors. */
export const stickerAgentTools: DesignMcpTool[] = [
  {
    name: "stamp_design_stickers",
    description:
      "Stamps stickers on the design's page on screen as one undo step and returns their ids. " +
      "Each one gives a sticker id from list_stickers and the center of the stamp (x, y), with " +
      `an optional size (square; ${STICKER_NODE_DEFAULTS.size.w} by default), edgeColor, ` +
      "outline and parent (the frame under its center otherwise).",
    inputSchema: {
      type: "object",
      required: ["stickers"],
      properties: {
        stickers: {
          type: "array",
          items: {
            type: "object",
            required: ["sticker", "x", "y"],
            properties: {
              sticker: { type: "string", description: "Sticker id, e.g. seal:happy." },
              x: { type: "number" },
              y: { type: "number" },
              size: { type: "number" },
              edgeColor: EDGE_SCHEMA,
              outline: OUTLINE_SCHEMA,
              parent: {
                type: ["string", "null"],
                description: "Frame or section to put it in; null for the top of the page.",
              },
            },
          },
        },
      },
    },
    run: async (host, args) => {
      const stamps = recordList(args, "stickers").map(readStamp);
      const { engine } = requireDesign(host);
      // Load every picture before writing, so a bad id or a failed load changes nothing.
      const picked = await Promise.all(
        stamps.map(async (stamp) => {
          const def = await findStampableSticker(stamp.sticker);
          const edgeColor = def.restyle ? stamp.edgeColor : null;
          const source = await pickSticker(def, edgeColor ? { edgeColor } : null);
          return { source, edgeColor };
        }),
      );
      const context = { kinds: engine.kinds, lookup: (ref: string) => engine.getElement(ref) };
      const { doc } = engine;
      const ids = asUndoStep(doc, () =>
        stamps.map((stamp, i) => {
          const { source, edgeColor } = picked[i]!;
          if (!doc.hasAsset(source.assetId)) doc.addAsset(source.assetId, source.data);
          const node: StickerNodeElement = {
            ...createStickerNode(source, stickerRect(stamp, stamp.size), doc.nextIndex(), null),
            edgeColor,
            outline: stamp.outline,
          };
          const parentId =
            stamp.parent !== undefined
              ? checkParent(node, stamp.parent, context)
              : (containerAt(node, engine.elements(), engine.kinds)?.id ?? null);
          const placed: StickerNodeElement = { ...node, parentId };
          doc.add(placed);
          return node.id;
        }),
      );
      return { created: ids };
    },
  },
  {
    name: "restyle_design_stickers",
    description:
      "Changes stickers' edgeColor and/or outline as one undo step (only seal, common and " +
      "plugin art stickers have an edge to recolor).",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: {
        ids: { type: "array", items: { type: "string" } },
        edgeColor: EDGE_SCHEMA,
        outline: OUTLINE_SCHEMA,
      },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const stickers = readStickers(
        engine.getElement.bind(engine),
        requireNodes(engine, stringList(args, "ids")),
      );
      const edgeColor = "edgeColor" in args ? readEdgeColor(args.edgeColor) : undefined;
      const patches =
        edgeColor !== undefined
          ? await stickerEdgePatches(engine.doc, stickers, edgeColor)
          : new Map();
      if ("outline" in args) {
        for (const sticker of stickers) {
          const outline = readStickerOutline(args.outline, sticker.outline);
          patches.set(sticker.id, { ...patches.get(sticker.id), outline });
        }
      }
      if (patches.size > 0) asUndoStep(engine.doc, () => engine.doc.updateMany(patches));
      return { updated: [...patches.keys()] };
    },
  },
  {
    name: "convert_stickers_to_vectors",
    description:
      "Turns stickers drawn as SVG (seals, common stamps, emojis, plugin art) into groups of " +
      "vector layers that can be recolored one by one, as one undo step: the die-cut edge is an " +
      '"Edge" vector at the bottom, the shadow and outline the group\'s effects. Each group keeps ' +
      "the sticker's id. Raster stickers (the user's PNG or JPG) are left out.",
    inputSchema: {
      type: "object",
      required: ["ids"],
      properties: { ids: { type: "array", items: { type: "string" } } },
    },
    run: async (host, args) => {
      const { engine } = requireDesign(host);
      const stickers = readStickers(
        engine.getElement.bind(engine),
        requireNodes(engine, stringList(args, "ids")),
      );
      const converted = asUndoStep(engine.doc, () =>
        stickers.flatMap((sticker) => stickerToVectors(engine.doc, sticker) ?? []),
      );
      const skipped = stickers.map((s) => s.id).filter((id) => !converted.includes(id));
      return { converted, ...(skipped.length > 0 ? { skipped } : {}) };
    },
  },
];

function readStickers(get: (id: string) => unknown, ids: readonly string[]): StickerNodeElement[] {
  return ids.map((id) => {
    const el = get(id) as StickerNodeElement | undefined;
    if (el?.type !== "sticker") throw new Error(`The layer ${id} isn't a sticker.`);
    return el;
  });
}

function readStamp(args: ToolArgs) {
  const size = optionalNumber(args, "size");
  if (size !== undefined && size < STICKER_NODE_DEFAULTS.size.w / 4) {
    throw new Error(`"size" must be at least ${STICKER_NODE_DEFAULTS.size.w / 4}.`);
  }
  return {
    sticker: stringArg(args, "sticker"),
    x: optionalNumber(args, "x") ?? 0,
    y: optionalNumber(args, "y") ?? 0,
    size,
    edgeColor: "edgeColor" in args ? readEdgeColor(args.edgeColor) : null,
    outline: "outline" in args ? readStickerOutline(args.outline, null) : null,
    parent: "parent" in args ? args.parent : undefined,
  };
}
