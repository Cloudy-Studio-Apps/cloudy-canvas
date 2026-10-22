import type { RulerGuide } from "@canvas";
import type { FigNode } from "@canvas/figma";

/** A Figma page's ruler guides (Figma's offsets are world units, as ours). */
export function figPageGuides(page: FigNode): RulerGuide[] {
  const guides: RulerGuide[] = [];
  for (const { axis, offset } of page.guides ?? []) {
    if (typeof offset !== "number" || !Number.isFinite(offset)) continue;
    if (axis === "X") guides.push({ axis: "x", value: Math.round(offset * 100) / 100 });
    else if (axis === "Y") guides.push({ axis: "y", value: Math.round(offset * 100) / 100 });
  }
  return guides;
}
