import type { Rect } from "../../geometry.types";
import type { PdfExportOptions, PdfPageSize } from "./pdf-options.types";
import type { PdfMatrix, PdfPageLayout } from "./pdf-writer.types";

/** PDF points per world unit, which reads units as CSS pixels. */
const POINTS_PER_UNIT = 0.75;
const POINTS_PER_MM = 72 / 25.4;
const PAPER: Readonly<Record<Exclude<PdfPageSize, "fit">, [number, number]>> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  a3: [841.89, 1190.55],
};

/** The page `rect` goes on: its own size, or fitted and centered on paper inside the margin. */
export function pdfPageLayout(rect: Rect, options: PdfExportOptions): PdfPageLayout {
  if (options.page === "fit") {
    const width = rect.w * POINTS_PER_UNIT;
    const height = rect.h * POINTS_PER_UNIT;
    return { width, height, scale: POINTS_PER_UNIT, left: 0, top: height };
  }
  const [short, long] = PAPER[options.page];
  const landscape =
    options.orientation === "landscape" || (options.orientation === "auto" && rect.w > rect.h);
  const width = landscape ? long : short;
  const height = landscape ? short : long;
  const margin = Math.min(options.margin * POINTS_PER_MM, Math.min(width, height) / 2 - 1);
  const scale = Math.min((width - margin * 2) / rect.w, (height - margin * 2) / rect.h);
  return {
    width,
    height,
    scale,
    left: (width - rect.w * scale) / 2,
    top: (height + rect.h * scale) / 2,
  };
}

/** The map from world units to the page's points (PDF's y grows up). */
export function pageMatrix({ scale, left, top }: PdfPageLayout, rect: Rect): PdfMatrix {
  return [scale, 0, 0, -scale, left - rect.x * scale, top + rect.y * scale];
}
