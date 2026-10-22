import {
  defaultGradientTransform,
  invertAffine,
  type GradientTransform,
  type GradientType,
} from "@canvas";
import {
  hexBytes,
  hexOf,
  type FigImportContext,
  type FigMatrix,
  type FigPaint,
} from "@canvas/figma";

import { imagePaint, solidPaint, type GradientPaint, type Paint } from "../../modules";

const GRADIENTS: Record<string, GradientType> = {
  GRADIENT_LINEAR: "linear",
  GRADIENT_RADIAL: "radial",
  GRADIENT_ANGULAR: "angular",
  GRADIENT_DIAMOND: "diamond",
};

/**
 * Figma paints as ours: solid colors, gradients and images; other paints (video, emoji) are left
 * out.
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
  const gradient = GRADIENTS[type];
  if (gradient) return convertGradient(paint, gradient, opacity, visible, ctx);
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

function convertGradient(
  paint: FigPaint,
  type: GradientType,
  opacity: number,
  visible: boolean,
  ctx: FigImportContext,
): GradientPaint | null {
  const stops = (paint.stops ?? []).map((stop) => ({
    position: Math.min(1, Math.max(0, stop.position ?? 0)),
    color: hexOf(stop.color),
    opacity: stop.color?.a ?? 1,
  }));
  if (stops.length === 0) {
    ctx.warnings.add("gradients without colors were left out");
    return null;
  }
  // One stop draws as one color everywhere.
  if (stops.length === 1) stops.push({ ...stops[0]!, position: 1 });
  return { type, stops, transform: gradientTransform(paint.transform, type), opacity, visible };
}

/** Figma's gradient transform as ours (the same matrix), or the default when it's flat. */
function gradientTransform(m: FigMatrix | undefined, type: GradientType): GradientTransform {
  if (!m) return defaultGradientTransform(type);
  const transform: GradientTransform = [
    [m.m00, m.m01, m.m02],
    [m.m10, m.m11, m.m12],
  ];
  return invertAffine(transform) ? transform : defaultGradientTransform(type);
}
