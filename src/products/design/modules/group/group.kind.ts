import type { ElementBuildContext, ElementPatch } from "@canvas";

import { DesignNodeKind } from "../core";
import { GROUP_TYPE } from "./group.constants";
import type { GroupElement } from "./group.types";

/**
 * Groups: they're never hit themselves (a click on a child selects the group, see
 * `groupSelectTarget`), draw nothing, aren't drop targets and take no paints.
 */
export class GroupKind extends DesignNodeKind<GroupElement> {
  readonly type = GROUP_TYPE;
  readonly label = "Group";
  readonly description = "Layers that select and move together.";
  override readonly resizable = false;
  override readonly fillable = false;
  override readonly strokable = false;

  draw(): void {}

  override hitTest(): boolean {
    return false;
  }

  /** Turning a group turns its children (its members); it stays the box round them. */
  override rotate(): ElementPatch<GroupElement> {
    return {};
  }

  /** A group's turn is its children's: agents turn it with `rotate_nodes`. */
  override completePatch(
    el: GroupElement,
    patch: ElementPatch<GroupElement>,
    context: ElementBuildContext,
  ): ElementPatch<GroupElement> {
    if ("rotation" in patch)
      throw new Error("A group doesn't turn itself: turn it (its layers) with rotate_nodes.");
    return super.completePatch(el, patch, context);
  }

  /** Scaling a group scales its children (its members); it stays the box round them. */
  override scale(): ElementPatch<GroupElement> {
    return {};
  }

  /** Flipping a group flips its children (its members). */
  override flip(): ElementPatch<GroupElement> {
    return {};
  }

  /** Its outline is its children's, which a moved child would drag along: they're the targets. */
  override snapTarget(): boolean {
    return false;
  }
}
