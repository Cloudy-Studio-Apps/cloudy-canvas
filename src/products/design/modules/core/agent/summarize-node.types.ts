import type { ElementSummary } from "@canvas";

import type { MaskType } from "../node";

/** A layer in listings: the element summary (its `label` is the layer's name) and its place. */
export interface NodeSummary extends ElementSummary {
  /** The frame, section or group holding it; `null` at the top of the page. */
  parentId: string | null;
  /** Set when the layer is hidden. */
  hidden?: true;
  /** Set on masks: how they mask, and whether inverted. */
  mask?: { type: MaskType; inverted?: true };
  /** The mask the layer shows through, directly (set on the layers a mask masks). */
  maskedBy?: string;
  /** The types of its visible effects, bottom to top (left out when it has none). */
  effects?: string[];
}
