import type { FlatSpreadProps } from "./preview.types";
import { PreviewPage } from "./preview-page";

/** The spread as it is, side by side and flat (the preview with 3D off). */
export function FlatSpread({ frames, width }: FlatSpreadProps) {
  return (
    <div className="flex gap-0.5 shadow-lifted">
      {frames.map((frame) => (
        <PreviewPage key={frame.id} frame={frame} width={width} />
      ))}
    </div>
  );
}
