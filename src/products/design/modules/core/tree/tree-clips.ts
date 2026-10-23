import {
  intersectRects,
  rectsEqual,
  type CanvasElement,
  type ElementClip,
  type ElementKinds,
} from "@canvas";

import { DesignNodeKind, isDesignNode } from "../node";

/**
 * The design's clips (`CanvasProduct.clips`): a node inside frames that clip their content shows
 * only where all of them overlap. The nearest clipping frame gives the corner radius when its area
 * is the whole clip; a clip narrowed by an outer frame keeps square corners. A node inside a
 * hidden frame or group gets an empty clip, so it's hidden too. Where a turned frame is one of
 * them, the nearest clipping frame's area alone clips (turned areas don't overlap into a rect).
 */
export function treeClips(
  elements: readonly CanvasElement[],
  kinds: ElementKinds,
): Map<string, ElementClip> {
  const byId = new Map(elements.map((el) => [el.id, el]));
  /** Parent id → the clip of its children (`null`: none), worked out once per parent. */
  const cache = new Map<string, ElementClip | null>();

  const clipInside = (parentId: string | null, depth: number): ElementClip | null => {
    if (!parentId || depth > elements.length) return null;
    const cached = cache.get(parentId);
    if (cached !== undefined) return cached;
    const parent = byId.get(parentId);
    let clip: ElementClip | null = null;
    const kind = parent ? kinds.kindOf(parent) : null;
    if (parent && isDesignNode(parent) && !parent.visible) {
      // A hidden frame or group hides what it holds: nothing of it is drawn or hit.
      clip = { rect: { x: parent.x, y: parent.y, w: 0, h: 0 }, radius: 0 };
    } else if (parent && isDesignNode(parent)) {
      const own = kind instanceof DesignNodeKind ? kind.contentClip(parent) : null;
      const outer = clipInside(parent.parentId, depth + 1);
      clip = own && outer ? intersect(own, outer) : (own ?? outer);
    }
    cache.set(parentId, clip);
    return clip;
  };

  const clips = new Map<string, ElementClip>();
  for (const el of elements) {
    if (!isDesignNode(el)) continue;
    const clip = clipInside(el.parentId, 0);
    if (clip) clips.set(el.id, clip);
  }
  return clips;
}

function intersect(inner: ElementClip, outer: ElementClip): ElementClip {
  // Turned areas don't overlap into a rect: the nearer frame's area is the clip.
  if (inner.rotation || outer.rotation) return inner;
  const rect = intersectRects(inner.rect, outer.rect);
  const radius = rectsEqual(rect, inner.rect)
    ? inner.radius
    : rectsEqual(rect, outer.rect)
      ? outer.radius
      : 0;
  return { rect, radius };
}
