import type { Rect } from "@canvas";

import type { DesignNode } from "../core";

/** The nodes an auto layout reads, as they are now (the document's, mid-edit). */
export interface LayoutTree {
  get(id: string): DesignNode | undefined;
  /** Its children, in `index` order. */
  children(id: string): DesignNode[];
}

/** A layer of an auto layout frame as it is: where its box is and whether it can be resized. */
export interface PlacedChild {
  node: DesignNode;
  /** The box it takes in the layout, from the frame's corner in its unturned frame. */
  box: Rect;
  /** Whether it can only be moved: turned in the frame, or made of its children (a group). */
  moveOnly: boolean;
}
