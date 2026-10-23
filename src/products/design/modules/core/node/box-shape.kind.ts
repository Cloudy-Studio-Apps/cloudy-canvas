import type { ElementSpec, Rect, Size } from "@canvas";

import type { DesignToolOptions } from "../../../design-options.types";
import type { VectorNetwork } from "../network/network.types";
import { DesignNodeKind } from "./design-node.kind";
import type { DesignNode, NodeGeometry } from "./design-node.types";
import { networkGeometry } from "./node-geometry";
import type { NodeBuildContext } from "./node-build.types";

/** Size of a clicked shape when the kind's defaults give none. */
const FALLBACK_SIZE: Size = { w: 100, h: 100 };

/**
 * The base of nodes drawn as a box (rectangles, ellipses, frames, polygons, stars): the kind makes
 * the node and says how big a click makes it, so one `BoxDrawTool` draws any of them.
 */
export abstract class BoxShapeKind<E extends DesignNode = DesignNode> extends DesignNodeKind<E> {
  override readonly creatable: boolean = true;

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

  /** Its outline's geometry (a simple outline: nothing to normalize). */
  protected override buildGeometry(el: E): NodeGeometry | null {
    const net = this.vectorNetwork(el);
    return net ? networkGeometry(net, false) : null;
  }

  /** Size of a node placed with a click (its defaults' `size` unless the options decide). */
  clickSize(_options: DesignToolOptions): Size {
    return this.defaults.size ?? FALLBACK_SIZE;
  }

  /** An agent's node: its `w`/`h`, or what a click places; subclasses add their own fields. */
  protected override nodeFromSpec(spec: ElementSpec, index: string, context: NodeBuildContext): E {
    const rect = this.specRect(spec, this.specSize(spec, context.options));
    return this.createNode(rect, context.nameFor(this.label), index, null, context.options);
  }

  /** The size of an agent's node when its spec gives no `w`/`h`. */
  protected specSize(_spec: ElementSpec, options: DesignToolOptions): Size {
    return this.clickSize(options);
  }
}
