import type { MarginGuideProps } from "./canvas.types";

/** A page's safe area (inside its margin), dashed. */
export function MarginGuide({ rect }: MarginGuideProps) {
  return (
    <span
      className="absolute border border-dashed border-ring"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    />
  );
}
