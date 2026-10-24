import {
  asUndoStep,
  optionalNumber,
  optionalString,
  recordList,
  stringArg,
  type ToolArgs,
} from "@canvas";
import {
  findStampableSticker,
  matchesSticker,
  stickerAssetId,
  stickerPicture,
  type StickerDef,
} from "@shared/core";

import { STICKER_DEFAULTS } from "./sticker.defaults";
import { createSticker } from "./sticker.factory";
import { requireBoard } from "../../agent/board-access";
import type { BoardAgentTool } from "../../agent/board-agent.types";
import { stickerSections } from "./agent-stickers";

const MAX_RESULTS = 60;

/** Stamping reactions: seals, common stamps and emojis. */
export const stickerTools: BoardAgentTool[] = [
  {
    name: "list_stickers",
    description:
      "Stickers agents can stamp with stamp_stickers (boards) and stamp_design_stickers " +
      "(designs): the foca watona seal moods (set seal), common stamps (common), the sets " +
      "plugins add and emojis (smileys, people, nature, food, travel, activities, objects, " +
      `symbols, flags). Search by words in the name; at most ${MAX_RESULTS} results.`,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Words the sticker's name or keywords contain." },
        set: { type: "string", description: "Only this set, e.g. seal, common or smileys." },
      },
    },
    run: async (_host, args) => {
      const query = optionalString(args, "query") ?? "";
      const set = optionalString(args, "set");
      const found = (await stickerSections())
        .filter((section) => !set || section.id === set)
        .flatMap((section) =>
          section.stickers
            .filter((sticker) => matchesSticker(sticker, query))
            .map(({ id, label }) => ({ id, label, set: section.id })),
        );
      return { stickers: found.slice(0, MAX_RESULTS), total: found.length };
    },
  },
  {
    name: "stamp_stickers",
    description:
      "Stamps stickers on the board as one undo step and returns their ids. Each one gives a " +
      "sticker id from list_stickers and the center of the stamp (x, y), with an optional size " +
      `(it's square; ${STICKER_DEFAULTS.size.w} by default).`,
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
              sticker: {
                type: "string",
                description: "Sticker id, e.g. seal:happy or emoji:1f44d.",
              },
              x: { type: "number" },
              y: { type: "number" },
              size: { type: "number" },
            },
          },
        },
      },
    },
    run: async (host, args) => {
      const stamps = recordList(args, "stickers").map(readStamp);
      // Load every picture before writing, so a bad id or a failed load changes nothing.
      const defs = await Promise.all(stamps.map((stamp) => findStampableSticker(stamp.sticker)));
      const pictures = new Map<string, Uint8Array>();
      for (const def of new Map(defs.map((def) => [def.id, def])).values()) {
        pictures.set(def.id, await stickerPicture(def));
      }
      const { engine } = requireBoard(host);
      const { doc } = engine;
      const ids = asUndoStep(doc, () =>
        stamps.map((stamp, i) => {
          const def = defs[i] as StickerDef;
          const assetId = stickerAssetId(def.id);
          const picture = pictures.get(def.id);
          if (picture && !doc.hasAsset(assetId)) doc.addAsset(assetId, picture);
          const source = { sticker: def.id, label: def.label, assetId };
          const sticker = createSticker(source, { x: stamp.x, y: stamp.y }, doc.nextIndex());
          const size = stamp.size ?? sticker.w;
          const placed = {
            ...sticker,
            x: Math.round(stamp.x - size / 2),
            y: Math.round(stamp.y - size / 2),
            w: size,
            h: size,
          };
          doc.add(placed);
          return placed.id;
        }),
      );
      return { created: ids };
    },
  },
];

function readStamp(args: ToolArgs) {
  const size = optionalNumber(args, "size");
  if (size !== undefined && size < STICKER_DEFAULTS.size.w / 4) {
    throw new Error(`"size" must be at least ${STICKER_DEFAULTS.size.w / 4}.`);
  }
  return {
    sticker: stringArg(args, "sticker"),
    x: optionalNumber(args, "x") ?? 0,
    y: optionalNumber(args, "y") ?? 0,
    size,
  };
}
