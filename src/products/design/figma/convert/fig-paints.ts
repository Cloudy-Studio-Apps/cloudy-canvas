import { hexBytes, hexOf, type FigImportContext, type FigPaint } from "@canvas/figma";

import { imagePaint, solidPaint, type Paint } from "../../modules";

/**
 * Figma paints as ours: solid colors and images; a gradient becomes its first color (gradients
 * come later), and other paints (video, emoji) are left out.
 */
export function convertPaints(
  paints: readonly FigPaint[] | undefined,
  ctx: FigImportContext,
  allowImages = true,
): Paint[] {
  const result: Paint[] = [];
  for (const paint of paints ?? []) {
    const converted = convertPaint(paint, ctx, allowImages);
    if (converted) result.push(converted);
  }
  return result;
}

function convertPaint(paint: FigPaint, ctx: FigImportContext, allowImages: boolean): Paint | null {
  const visible = paint.visible ?? true;
  const opacity = paint.opacity ?? 1;
  const type = paint.type ?? "SOLID";
  if (type === "SOLID") {
    return { ...solidPaint(hexOf(paint.color), opacity * (paint.color?.a ?? 1)), visible };
  }
  if (type.startsWith("GRADIENT_")) {
    ctx.warnings.add("gradients became their first color");
    const color = paint.stops?.[0]?.color;
    return { ...solidPaint(hexOf(color), opacity * (color?.a ?? 1)), visible };
  }
  if (type === "IMAGE" && allowImages) {
    const hash = paint.image?.hash ?? paint.imageThumbnail?.hash;
    const assetId = hash ? ctx.imageAsset(hexBytes(hash)) : null;
    if (!assetId) {
      ctx.warnings.add("images missing from the file were left out");
      return null;
    }
    if (paint.imageScaleMode === "TILE") ctx.warnings.add("tiled images fill their layer");
    const scaleMode = paint.imageScaleMode === "FIT" ? "fit" : "fill";
    return { ...imagePaint(assetId, scaleMode), opacity, visible };
  }
  ctx.warnings.add(`${type.toLowerCase()} paints were left out`);
  return null;
}
