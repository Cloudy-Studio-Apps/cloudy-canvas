import type { CanvasElement, ElementBuildContext, ElementPatch, Point } from "@canvas";

import type { ChildResolveContext } from "./child-host.types";
import { DesignNodeKind } from "./design-node.kind";
import type { DesignNode } from "./design-node.types";

/**
 * The base of nodes made of their children (groups, booleans): a click on a child selects them
 * (until they're entered), turning, scaling and flipping them does it to their children, and
 * their geometry follows the children (`resolveFromChildren`, run by the core's `resolveTree`).
 * They aren't containers: nothing is dropped into them on the canvas.
 */
export abstract class ChildHostKind<E extends DesignNode = DesignNode> extends DesignNodeKind<E> {
  override readonly childHost: boolean = true;
  override readonly ownsShape: boolean = false;
  override readonly resizable: boolean = false;

  /**
   * The node as its children make it (bounds, and whatever else it derives), from the children
   * already resolved. The result is the scene's, never stored.
   */
  abstract resolveFromChildren(
    el: E,
    children: readonly CanvasElement[],
    context: ChildResolveContext,
  ): E;

  /** Nothing of its own is hit by default: a click reaches its children. */
  override hitTest(_el: E, _p: Point, _tolerance: number): boolean {
    return false;
  }

  /** Turning it turns its children (its members); it stays the box round them. */
  override rotate(): ElementPatch<E> {
    return {};
  }

  /** Its turn is its children's: agents turn it with `rotate_nodes`. */
  override completePatch(
    el: E,
    patch: ElementPatch<E>,
    context: ElementBuildContext,
  ): ElementPatch<E> {
    if ("rotation" in patch) {
      throw new Error(
        `A ${this.label.toLowerCase()} doesn't turn itself: turn it (its layers) with rotate_nodes.`,
      );
    }
    return super.completePatch(el, patch, context);
  }

  /** Scaling it scales its children (its members). */
  override scale(): ElementPatch<E> {
    return {};
  }

  /** Flipping it flips its children (its members). */
  override flip(): ElementPatch<E> {
    return {};
  }

  /** Its outline is its children's, which a moved child would drag along: they're the targets. */
  override snapTarget(): boolean {
    return false;
  }
}
