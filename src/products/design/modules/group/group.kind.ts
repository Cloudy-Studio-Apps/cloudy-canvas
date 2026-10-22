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
}
