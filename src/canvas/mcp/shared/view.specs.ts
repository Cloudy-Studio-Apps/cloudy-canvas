import type { SharedToolSpec } from "./shared-tool.types";

/** Keeps the pictures `view_snapshot` sends agents small enough to read. */
export const VIEW_SNAPSHOT_MAX_SIDE = 2000;

/** `view_fit`: fits everything in the agent's view. */
export const VIEW_FIT_TOOL: SharedToolSpec = {
  name: "fit",
  description:
    "Fits the whole board, or the whole page you work on in a design, in your own view (the " +
    "user sees it when they follow you).",
  inputSchema: { type: "object", properties: {} },
};

/** `view_fit_elements`: shows some elements in the agent's view. */
export const VIEW_FIT_ELEMENTS_TOOL: SharedToolSpec = {
  name: "fit_elements",
  description: "Shows elements in your own view and selects them (your selection, not the user's).",
  inputSchema: {
    type: "object",
    required: ["ids"],
    properties: { ids: { type: "array", items: { type: "string" } } },
  },
};

/** `view_snapshot`: a picture of the file, or of some elements, for the agent to look at. */
export const VIEW_SNAPSHOT_TOOL: SharedToolSpec = {
  name: "snapshot",
  description:
    "Returns a PNG picture of the board, or of the page you work on in a design, or of some " +
    "elements, as the user sees them, to check how your changes look. At most " +
    `${VIEW_SNAPSHOT_MAX_SIDE} pixels on its longest side.`,
  inputSchema: {
    type: "object",
    properties: {
      ids: {
        type: "array",
        items: { type: "string" },
        description:
          "Elements to include, with what moves with them (what they hold, in a design). Omit " +
          "for the whole board or page.",
      },
      scale: { type: "number", description: "Pixels per world unit (1 by default)." },
    },
  },
};
