import type { ElementSummary } from "@canvas";

/** A layer in listings: the element summary (its `label` is the layer's name) and its place. */
export interface NodeSummary extends ElementSummary {
  /** The frame, section or group holding it; `null` at the top of the page. */
  parentId: string | null;
  /** Set when the layer is hidden. */
  hidden?: true;
}
