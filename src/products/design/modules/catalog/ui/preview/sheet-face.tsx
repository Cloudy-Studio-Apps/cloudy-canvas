import { cn } from "@shared/ui/kit";
import type { SheetFaceProps } from "./preview.types";
import { SidePicture } from "./side-picture";

/** One face of a turning page: a side's picture, or blank paper (the back of a single page). */
export function SheetFace({ side, width, height, back = false, shadeRef }: SheetFaceProps) {
  return (
    <div
      className={cn("absolute inset-0 bg-surface backface-hidden", back && "rotate-y-180")}
      style={{ width, height }}
    >
      <SidePicture side={side} width={width} height={height} />
      <span
        ref={shadeRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-foreground opacity-0"
      />
    </div>
  );
}
