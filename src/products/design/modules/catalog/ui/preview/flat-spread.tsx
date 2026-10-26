import { sideWidth } from "../../model/page-span";
import type { FlatSpreadProps } from "./preview.types";
import { flatScale } from "./preview-size";
import { SidePicture } from "./side-picture";

/** The spread as it is, its sides side by side and flat (the preview with 3D off). */
export function FlatSpread({ sides, pageSize }: FlatSpreadProps) {
  const scale = flatScale(sides, pageSize);
  return (
    <div className="flex shadow-lifted">
      {sides.map((side, i) => (
        <SidePicture
          key={i}
          side={side}
          width={sideWidth(side, pageSize) * scale}
          height={pageSize.h * scale}
        />
      ))}
    </div>
  );
}
