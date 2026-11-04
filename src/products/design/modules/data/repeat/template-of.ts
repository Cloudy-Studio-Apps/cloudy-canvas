import type { DesignNode } from "../../core";
import type { FrameElement } from "../../frame";
import { dataCopyTag, repeatOf } from "./repeat-fields";

/**
 * The child a frame repeats, among its `children` (by sibling order). The repeat names it
 * (`repeat.template`, set with the repeat): that child, or in a copy of the frame (an iterator
 * copied with an outer template) the child copied from it (its tag's `source`). Without one (an
 * older record, or a name no child answers to), the first child that isn't one of the frame's
 * own copies. Once copies are detached (untagged) only the name tells them from the template.
 */
export function templateOf(
  frame: FrameElement,
  children: readonly DesignNode[],
): DesignNode | null {
  const own = children.filter((child) => dataCopyTag(child)?.iterator !== frame.id);
  const named = repeatOf(frame)?.template;
  if (named) {
    const found =
      own.find((child) => child.id === named) ??
      own.find((child) => dataCopyTag(child)?.source === named);
    if (found) return found;
  }
  return own[0] ?? null;
}
