import type { DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";

export interface ContainerRepeatProps {
  frame: FrameElement;
  /** The frame's children, by sibling order. */
  layers: readonly DesignNode[];
}
