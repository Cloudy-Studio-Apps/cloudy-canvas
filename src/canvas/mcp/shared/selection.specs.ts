import type { SharedToolSpec } from "./shared-tool.types";

/** `selection_get`: the user's selection. */
export const SELECTION_GET_TOOL: SharedToolSpec = {
  name: "get",
  description:
    "The elements the user has selected (a board's shapes, a design's layers), as summaries " +
    "(not yours: selection_set sets yours). In a design they may be on another page than yours.",
  inputSchema: { type: "object", properties: {} },
};

/** `selection_set`: the agent's own selection. */
export const SELECTION_SET_TOOL: SharedToolSpec = {
  name: "set",
  description:
    "Sets your selection (the user sees it outlined in your colour), e.g. to show what changed. " +
    "Empty clears it. It doesn't change the user's selection.",
  inputSchema: {
    type: "object",
    required: ["ids"],
    properties: {
      ids: { type: "array", items: { type: "string" } },
      zoom: {
        type: "boolean",
        description: "Also show the element in your view when selecting one.",
      },
    },
  },
};
