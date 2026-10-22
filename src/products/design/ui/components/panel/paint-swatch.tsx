import { CHECKERBOARD } from "@canvas-ui";
import { isGradientPaint } from "@design";
import { gradientPreviewCss } from "../paint-picker/gradient-preview";
import { useAssetUrl } from "../../hooks";
import type { PaintSwatchProps } from "./paint-field.types";

/** A paint's small preview: its color, its gradient, or its image cropped to the square. */
export function PaintSwatch({ paint }: PaintSwatchProps) {
  const url = useAssetUrl(paint.type === "image" ? paint.assetId : null);
  return (
    <span
      className="relative block size-3.5 shrink-0 overflow-hidden rounded-xs border border-border-strong"
      style={{ background: CHECKERBOARD }}
    >
      <span
        className="absolute inset-0 bg-cover bg-center"
        style={
          paint.type === "solid"
            ? { backgroundColor: paint.color, opacity: paint.opacity }
            : isGradientPaint(paint)
              ? { backgroundImage: gradientPreviewCss(paint), opacity: paint.opacity }
              : { backgroundImage: url ? `url("${url}")` : undefined, opacity: paint.opacity }
        }
      />
    </span>
  );
}
