import { definePoint } from "@shared/core";
import type { ViewerPart } from "./viewer-part.types";

/** What modules and plugins add to the board's HTML viewer, by part id. */
export const boardViewerParts = definePoint<ViewerPart>("board.viewerParts", {
  keyOf: (part) => part.id,
});
