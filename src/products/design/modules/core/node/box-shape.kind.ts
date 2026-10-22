import type { Rect, Size } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import type { VectorNetwork } from "../network/network.types";
import { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";

/** Size of a clicked shape when the kind's defaults give none. */
const FALLBACK_SIZE: Size = { w: 100, h: 100 };

/**
 * The base of nodes drawn as a box (rectangles, ellipses, frames, polygons, stars): the kind makes
 * the node and says how big a click makes it, so one `BoxDrawTool` draws any of them.
 */
export abstract class BoxShapeKind<E extends DesignNode = DesignNode> extends DesignNodeKind<E> {
  /** A new node with these bounds, name, z-order index and parent, styled by the tool options. */
  abstract createNode(
    rect: Rect,
    name: string,
    index: string,
    parentId: string | null,
    options: DesignToolOptions,
  ): E;

  /**
   * The node's outline as a vector network (local coordinates), so editing its points turns it
   * into a vector; `null` for shapes that don't convert (frames, sections).
   */
  vectorNetwork(_el: E): VectorNetwork | null {
    return null;
  }

  /** Size of a node placed with a click (its defaults' `size` unless the options decide). */
  clickSize(_options: DesignToolOptions): Size {
    return this.defaults.size ?? FALLBACK_SIZE;
  }
}
