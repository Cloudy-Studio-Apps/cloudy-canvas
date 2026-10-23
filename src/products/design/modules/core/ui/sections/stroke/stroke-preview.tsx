import type { StrokePreviewProps } from "./stroke-preview.types";

/** Widest the preview draws a stroke, so heavy strokes still show their pattern. */
const MAX_WIDTH = 8;

const LINECAPS = { none: "butt", round: "round", square: "square" } as const;

/**
 * A live strip of the stroke as set: its dashes, ends and weight (scaled down together past
 * `MAX_WIDTH`, so the pattern keeps its proportions).
 */
export function StrokePreview({ node }: StrokePreviewProps) {
  const weight = Math.max(0.5, node.strokeWeight);
  const scale = Math.min(1, MAX_WIDTH / weight);
  const dashes = node.strokeDashes.map((n) => n * scale).join(" ");
  return (
    <svg
      aria-label="Stroke preview"
      role="img"
      className="h-8 w-full rounded-sm bg-muted text-foreground"
      preserveAspectRatio="none"
    >
      <line
        x1="12%"
        x2="88%"
        y1="50%"
        y2="50%"
        stroke="currentColor"
        strokeWidth={weight * scale}
        strokeDasharray={dashes || undefined}
        strokeLinecap={LINECAPS[node.strokeCap]}
      />
    </svg>
  );
}
