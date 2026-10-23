import type { CanvasElement, ElementKinds } from "@canvas";

/** What a child host gets when it's resolved from its children (`resolveFromChildren`). */
export interface ChildResolveContext {
  kinds: ElementKinds;
  /** Whether a child shows only inside a mask (a non-inverted one), which then wraps it. */
  insideMask(child: CanvasElement): boolean;
  /** A node's children, resolved (nested hosts already made from theirs), bottom to top. */
  childrenOf(el: CanvasElement): readonly CanvasElement[];
}
