import { readStrokeStyle } from "@design";
import type { StylePreviewProps } from "../core.points.types";

const LINECAPS = { none: "butt", round: "round", square: "square" } as const;

/** A stroke style's picture: a short line with its weight (capped), dashes and ends. */
export function StrokeStylePreview({ style }: StylePreviewProps) {
  const value = readStrokeStyle(style.value);
  const weight = Math.min(4, Math.max(1, value.strokeWeight ?? 1));
  const scale = weight / Math.max(1, value.strokeWeight ?? 1);
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-foreground" aria-hidden>
      <line
        x1="2"
        y1="8"
        x2="14"
        y2="8"
        stroke="currentColor"
        strokeWidth={weight}
        strokeDasharray={value.strokeDashes?.map((n) => n * scale).join(" ") || undefined}
        strokeLinecap={LINECAPS[value.strokeCap ?? "none"]}
      />
    </svg>
  );
}
