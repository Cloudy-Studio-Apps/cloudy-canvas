import { unionRects } from "../geometry";
import type { Rect } from "../geometry.types";
import { canvasBlob } from "./canvas-blob";
import { encodeCsv } from "./encode-csv";
import type { ExportHost, ExportOptions } from "./export.types";
import { exportPdf } from "./pdf";

/** Space around the exported elements, in world units. */
const EXPORT_PADDING = 16;
const DEFAULT_SCALE = 2;
/** Keeps the image within what GPUs can render in one texture. */
const MAX_PIXELS_PER_SIDE = 8192;
const JPEG_QUALITY = 0.92;

/**
 * Exports the elements of an area as an image (PNG, JPG), a vector SVG, a PDF page (`exportPdf`) or
 * CSV (the elements that have rows, e.g. tables). Throws with a message for the user when there's nothing
 * to export.
 */
export async function exportElements(host: ExportHost, options: ExportOptions): Promise<Blob> {
  const elements = host.elementsOf(options.area, options.ids);
  if (options.format === "csv") {
    const grids = elements.map((el) => host.rows(el)).filter((rows) => rows !== null);
    if (grids.length === 0) throw new Error("There are no tables to export as CSV.");
    return new Blob([encodeCsv(grids)], { type: "text/csv" });
  }

  const area = unionRects(elements.map((el) => host.bounds(el)));
  if (!area) throw new Error("There's nothing to export.");
  const rect = options.rect ?? padded(area, options.padding ?? EXPORT_PADDING);
  if (options.format === "svg") {
    const svg = await host.vector(elements, {
      rect,
      background: options.background === "transparent" ? null : host.background,
      links: host.createLinks(),
      text: options.svgText ?? "outlines",
    });
    return new Blob([svg], { type: "image/svg+xml" });
  }
  if (options.format === "pdf") {
    return exportPdf(host, elements, rect, options.background, options.pdf);
  }
  const scale = Math.min(
    options.scale ?? DEFAULT_SCALE,
    Math.min(options.maxSide ?? MAX_PIXELS_PER_SIDE, MAX_PIXELS_PER_SIDE) /
      Math.max(rect.w, rect.h),
  );
  const transparent = options.format === "png" && options.background === "transparent";
  const background = transparent ? null : host.background;
  const canvas = await host.snapshot(elements, {
    rect,
    scale,
    background,
    links: host.createLinks(),
  });

  if (options.format === "png") return canvasBlob(canvas, "image/png");
  return canvasBlob(canvas, "image/jpeg", JPEG_QUALITY);
}

/** Whether exporting the area as CSV would find something (an element with rows). */
export function hasRows(host: ExportHost, options: Pick<ExportOptions, "area" | "ids">): boolean {
  return host.elementsOf(options.area, options.ids).some((el) => host.rows(el) !== null);
}

function padded({ x, y, w, h }: Rect, padding: number): Rect {
  const left = Math.floor(x - padding);
  const top = Math.floor(y - padding);
  return {
    x: left,
    y: top,
    w: Math.ceil(x + w + padding) - left,
    h: Math.ceil(y + h + padding) - top,
  };
}
