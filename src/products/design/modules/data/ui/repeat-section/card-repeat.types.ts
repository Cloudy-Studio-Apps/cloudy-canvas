import type { DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";

export interface CardRepeatProps {
  /** The selected layer. */
  node: DesignNode;
  /** Its parent frame, which would hold its copies. */
  frame: FrameElement;
  /** The frame's children, by sibling order. */
  layers: readonly DesignNode[];
}
