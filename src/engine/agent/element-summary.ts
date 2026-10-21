import { kindOf, type AnyElement } from "../elements";
import type { ElementSummary } from "./element-summary.types";

export function summarizeElement(el: AnyElement): ElementSummary {
  const { label, kind } = kindOf(el).describe(el);
  const bounds = kindOf(el).bounds(el);
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
