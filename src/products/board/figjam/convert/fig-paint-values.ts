import { cropInside, transformCrop, type ImageCrop } from "@canvas";
import { hexBytes, hexOf, type FigPaint } from "@canvas/figma";

/** The color of the first visible solid paint (`#rrggbb`), or `null` when there's none. */
export function solidColor(paints: readonly FigPaint[] | undefined): string | null {
  const paint = paints?.find(
    (p) => p.type === "SOLID" && p.visible !== false && (p.opacity ?? 1) > 0,
  );
  return paint ? hexOf(paint.color) : null;
}

/** The hash (hex) of the topmost visible image paint, as its file is named, or `null`. */
export function imageHash(paints: readonly FigPaint[] | undefined): string | null {
  const hash = imagePaintOf(paints)?.image?.hash;
  return hash ? hexBytes(hash) : null;
}

/** The part of the picture the topmost image paint shows when it's cropped (inside it), or `null`. */
export function imageCrop(paints: readonly FigPaint[] | undefined): ImageCrop | null {
  const paint = imagePaintOf(paints);
  const m = paint?.transform;
  if (paint?.imageScaleMode !== "STRETCH" || !m) return null;
  const crop = transformCrop([
    [m.m00, m.m01, m.m02],
    [m.m10, m.m11, m.m12],
  ]);
  return crop && cropInside(crop) ? crop : null;
}

function imagePaintOf(paints: readonly FigPaint[] | undefined): FigPaint | undefined {
  return [...(paints ?? [])].reverse().find((p) => p.type === "IMAGE" && p.visible !== false);
}
