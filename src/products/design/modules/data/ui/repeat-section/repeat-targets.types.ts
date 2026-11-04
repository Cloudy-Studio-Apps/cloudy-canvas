import type { DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";

/** What the Repeat section shows for the selected layer. */
export interface RepeatTargets {
  /** The parent frame that would repeat the layer as its card (not for a copy). */
  card: { frame: FrameElement; layers: DesignNode[] } | null;
  /** The layer itself as a container (a frame; a copy only when it's a copied iterator). */
  container: { frame: FrameElement; layers: DesignNode[] } | null;
}
