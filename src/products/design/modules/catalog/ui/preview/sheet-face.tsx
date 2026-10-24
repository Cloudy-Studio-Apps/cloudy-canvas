import { cn } from "@shared/ui/lib/utils";
import type { SheetFaceProps } from "./preview.types";
import { PreviewPage } from "./preview-page";

/** One face of a turning page: a page's picture, or blank paper (the back of a single page). */
export function SheetFace({ frame, width, height, back = false, shadeRef }: SheetFaceProps) {
  return (
    <div
      className={cn("absolute inset-0 bg-surface backface-hidden", back && "rotate-y-180")}
      style={{ width, height }}
    >
      {frame && <PreviewPage frame={frame} width={width} height={height} />}
      <span
        ref={shadeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-foreground opacity-0"
      />
    </div>
  );
}
