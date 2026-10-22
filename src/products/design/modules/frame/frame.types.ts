import type { ElementDefaults, Size } from "@canvas";

import type { DesignNode } from "../core";

/** A frame: a container for other nodes, like an artboard or a screen. */
export interface FrameElement extends DesignNode {
  type: "frame";
  cornerRadius: number;
  /** Hides what its children draw outside it (stored now; drawn in a later step). */
  clipsContent: boolean;
}

export interface FrameDefaults extends ElementDefaults {
  size: Size;
  fill: string;
  cornerRadius: number;
  clipsContent: boolean;
  /** The name drawn above frames at the top of the page. */
  label: { fontSize: number; gap: number; color: string };
}

/** A common frame size, picked in the frame tool's panel and the frame section. */
export interface FramePreset {
  id: string;
  label: string;
  group: string;
  size: Size;
}
