import type { SharedToolSpec } from "./shared-tool.types";

/** `clipboard_png_copy`: elements to the system clipboard as a PNG. */
export const CLIPBOARD_PNG_COPY_TOOL: SharedToolSpec = {
  name: "png_copy",
  description:
    "Copies elements (with what moves with them, or what they hold in a design) to the system " +
    "clipboard as a PNG image with a transparent background, as Ctrl+Shift+C does (a design's " +
    "has no margin). Without ids, copies the user's selection.",
  inputSchema: {
    type: "object",
    properties: { ids: { type: "array", items: { type: "string" } } },
  },
};
