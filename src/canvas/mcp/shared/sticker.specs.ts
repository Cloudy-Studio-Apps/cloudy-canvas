import type { SharedToolSpec } from "./shared-tool.types";

/** A stamped sticker's side when the call gives no `size` (both products' default). */
const STICKER_SIZE = 96;

/** `sticker_stamp`: stamps stickers from the app's catalog on the open file. */
export const STICKER_STAMP_TOOL: SharedToolSpec = {
  name: "stamp",
  description:
    "Stamps stickers as one undo step and returns their ids: on the board, or on the page you " +
    "work on in a design (as sticker layers that keep their proportions). Each one gives a " +
    "sticker id from sticker_list and the center of the stamp (x, y), with an optional size " +
    `(it's square; ${STICKER_SIZE} by default). In a design it also takes edgeColor, outline ` +
    "and parent (the frame under its center otherwise).",
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
            sticker: { type: "string", description: "Sticker id, e.g. seal:happy or emoji:1f44d." },
            x: { type: "number" },
            y: { type: "number" },
            size: { type: "number" },
            edgeColor: {
              type: ["string", "null"],
              description:
                "Designs only. The die-cut edge's color (#RRGGBB) of seal, common and plugin " +
                "art stickers; null for white.",
            },
            outline: {
              type: ["object", "null"],
              description:
                "Designs only. A border following the sticker's shape: { color: #RRGGBB, " +
                "width, visible }; null removes it.",
              properties: {
                color: { type: "string" },
                width: { type: "number" },
                visible: { type: "boolean" },
              },
            },
            parent: {
              type: ["string", "null"],
              description:
                "Designs only. Frame or section to put it in; null for the top of the page.",
            },
          },
        },
      },
    },
  },
};
