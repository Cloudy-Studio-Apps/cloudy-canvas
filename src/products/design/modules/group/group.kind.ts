import { elementBounds, unionRects, type CanvasElement } from "@canvas";

import { ChildHostKind, type ChildResolveContext } from "../core";
import { GROUP_TYPE } from "./group.constants";
import type { GroupElement } from "./group.types";

/**
 * Groups: they draw nothing and take no paints; a click on a child selects the group (until it's
 * entered), and they aren't drop targets. Their bounds wrap their children as they show (turned
 * ones by the box round them), leaving out what a mask hides, so a mask group is as large as its
 * mask, as in Figma. A group itself never turns: its children do.
 */
export class GroupKind extends ChildHostKind<GroupElement> {
  readonly type = GROUP_TYPE;
  readonly label = "Group";
  readonly description = "Layers that select and move together.";
  override readonly fillable = false;
  override readonly strokable = false;
  /** Nothing to copy or paste: a group draws nothing of its own. */
  override readonly styleFields: readonly string[] = [];

  draw(): void {}

  resolveFromChildren(
    el: GroupElement,
    children: readonly CanvasElement[],
    { kinds, insideMask }: ChildResolveContext,
  ): GroupElement {
    const rect = unionRects(
      children
        .filter((child) => !insideMask(child))
        .map((child) => elementBounds(kinds.kindOf(child), child)),
    );
    return rect ? { ...el, ...rect, rotation: 0 } : el;
  }
}
