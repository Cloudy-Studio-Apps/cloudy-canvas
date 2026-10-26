import { cn } from "@shared/ui/kit";
import type { GradeBadgeProps } from "./contrast-ui.types";

const TONES = {
  AAA: "text-success bg-success-soft",
  AA: "text-success bg-success-soft",
  "AA large": "text-warning bg-warning-soft",
  fail: "text-destructive bg-destructive-soft",
} as const;

/** A WCAG grade as a small tag in its tone. */
export function GradeBadge({ grade }: GradeBadgeProps) {
  return (
    <span
      className={cn("rounded-xs px-1.5 text-[10px] font-semibold whitespace-nowrap", TONES[grade])}
    >
      {grade === "fail" ? "Fail" : grade}
    </span>
  );
}
