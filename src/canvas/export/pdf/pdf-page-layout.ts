import type { Rect } from "../../geometry.types";
import type { PdfExportOptions, PdfPageSize } from "./pdf-options.types";
import type { PdfMatrix, PdfPageLayout } from "./pdf-writer.types";

const POINTS_PER_MM = 72 / 25.4;
const PAPER: Readonly<Record<Exclude<PdfPageSize, "fit">, [number, number]>> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  a3: [841.89, 1190.55],
};

/** The page `rect` goes on: its own size, or fitted and centered on paper inside the margin. */
export function pdfPageLayout(rect: Rect, options: PdfExportOptions): PdfPageLayout {
  if (options.page === "fit") {
    const scale = options.pointsPerUnit;
    const width = rect.w * scale;
    const height = rect.h * scale;
    return { width, height, scale, left: 0, top: height };
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
