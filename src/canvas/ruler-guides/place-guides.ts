import type { CanvasElement, ElementKinds } from "../elements";
import type { PlacedGuide, RulerGuide } from "./ruler-guides.types";

/**
 * Where the guides show: page guides as they are, a frame's guides from its corner inside its
 * bounds. Guides of a frame that's gone or turned (whose axes aren't the rulers') are left out.
 */
export function placeGuides(
  guides: readonly RulerGuide[],
  get: (id: string) => CanvasElement | undefined,
  kinds: ElementKinds,
): PlacedGuide[] {
  const placed: PlacedGuide[] = [];
  guides.forEach(({ axis, value, frame }, index) => {
    if (!frame) {
      placed.push({ index, axis, value, frame: null, within: null });
      return;
    }
    const el = get(frame);
    if (!el || el.rotation) return;
    const within = kinds.kindOf(el).bounds(el);
    placed.push({ index, axis, value: within[axis] + value, frame, within });
  });
  return placed;
}

/** Whether a frame's guide crosses its frame (page guides always show). */
export function guideInside({ axis, value, within }: PlacedGuide): boolean {
  if (!within) return true;
  const start = axis === "x" ? within.x : within.y;
  const size = axis === "x" ? within.w : within.h;
  return value >= start && value <= start + size;
}
