import { definePoint } from "@shared/core";

import type { FrameLabelTag } from "./frame.points.types";

/**
 * Words drawn after a top-level frame's name on the canvas (a brochure's template page: "Product
 * · row 2 of 40"); the first answer that isn't `null` wins. Asked on every redraw of the frame:
 * answer from what's already worked out, never by walking the document.
 */
export const frameLabelTags = definePoint<FrameLabelTag>("design.frame.labelTags");
