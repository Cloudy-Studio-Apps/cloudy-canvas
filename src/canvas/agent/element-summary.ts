import type { CanvasElement, ElementKinds } from "../elements";
import type { ElementSummary } from "./element-summary.types";

export function summarizeElement(kinds: ElementKinds, el: CanvasElement): ElementSummary {
  const elementKind = kinds.kindOf(el);
  const { label, kind } = elementKind.describe(el);
  const bounds = elementKind.bounds(el);
  return {
    id: el.id,
    type: el.type,
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    w: Math.round(bounds.w),
    h: Math.round(bounds.h),
    ...(label ? { label } : {}),
    ...(kind ? { kind } : {}),
  };
}
