import type { ElementSummary } from "@canvas";

import type { LayerBlendMode, MaskType } from "../node";

/** A layer in listings: the element summary (its `label` is the layer's name) and its place. */
export interface NodeSummary extends ElementSummary {
  /** The frame, section or group holding it; `null` at the top of the page. */
  parentId: string | null;
  /** Set when the layer is hidden. */
  hidden?: true;
  /** Set when it blends some way other than pass-through or normal. */
  blendMode?: LayerBlendMode;
  /** Set on masks: how they mask, and whether inverted. */
  mask?: { type: MaskType; inverted?: true };
  /** The mask the layer shows through, directly (set on the layers a mask masks). */
  maskedBy?: string;
  /** The types of its visible effects, bottom to top (left out when it has none). */
  effects?: string[];
}
