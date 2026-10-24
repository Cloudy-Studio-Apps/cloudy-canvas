import { unionRects } from "../geometry";
import type { Rect } from "../geometry.types";
import { canvasBlob } from "./canvas-blob";
import { encodeCsv } from "./encode-csv";
import { encodePdf } from "./encode-pdf";
import type { ExportHost, ExportOptions } from "./export.types";

/** Space around the exported elements, in world units. */
const EXPORT_PADDING = 16;
const DEFAULT_SCALE = 2;
/** Keeps the image within what GPUs can render in one texture. */
const MAX_PIXELS_PER_SIDE = 8192;
const JPEG_QUALITY = 0.92;

/**
 * Exports the elements of an area as an image (PNG, JPG), a PDF page or CSV (the elements that
 * have rows, e.g. tables). Throws with a message for the user when there's nothing to export.
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
  const rect = options.rect ?? padded(area);
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
  const jpeg = await canvasBlob(canvas, "image/jpeg", JPEG_QUALITY);
  if (options.format === "jpg") return jpeg;
  return encodePdf(
    new Uint8Array(await jpeg.arrayBuffer()),
    { width: canvas.width, height: canvas.height },
    { width: rect.w, height: rect.h },
  );
}

/** Whether exporting the area as CSV would find something (an element with rows). */
export function hasRows(host: ExportHost, options: Pick<ExportOptions, "area" | "ids">): boolean {
  return host.elementsOf(options.area, options.ids).some((el) => host.rows(el) !== null);
}

function padded({ x, y, w, h }: Rect): Rect {
  return {
    x: Math.floor(x - EXPORT_PADDING),
    y: Math.floor(y - EXPORT_PADDING),
    w: Math.ceil(w + EXPORT_PADDING * 2),
    h: Math.ceil(h + EXPORT_PADDING * 2),
  };
}
