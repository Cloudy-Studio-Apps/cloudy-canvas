import type { PdfColorOutput } from "./color";
import { apply, multiply, parseTransform } from "./pdf-matrix";
import { PDF_JPEG_QUALITY } from "./pdf-options";
import type { PdfDocument } from "./pdf-document";
import type { PdfExportOptions } from "./pdf-options.types";
import type { PdfMatrix } from "./pdf-writer.types";

const MAX_SIDE = 8192;
const POINTS_PER_INCH = 72;

/** An image element's file. */
export function hrefOf(element: Element): string {
  return element.getAttribute("xlink:href") ?? "";
}

/**
 * Embeds every picture of the document, sized for the largest place it shows at (at `dpi`, never
 * above its own pixels). Returns their objects by file.
 */
export async function embedImages(
  doc: PdfDocument,
  root: Element,
  scale: number,
  { dpi, imageQuality }: PdfExportOptions,
  output: PdfColorOutput,
): Promise<Map<string, number>> {
  const sizes = new Map<string, { w: number; h: number }>();
  measure(root, [scale, 0, 0, scale, 0, 0], root, sizes);
  const refs = new Map<string, number>();
  for (const [href, size] of sizes) {
    const pixels = {
      w: (size.w / POINTS_PER_INCH) * dpi,
      h: (size.h / POINTS_PER_INCH) * dpi,
    };
    refs.set(href, await embedImage(doc, href, pixels, PDF_JPEG_QUALITY[imageQuality], output));
  }
  return refs;
}

/** Finds where pictures show, following `<use>`s into the `<defs>` they skip. */
function measure(
  element: Element,
  m: PdfMatrix,
  root: Element,
  sizes: Map<string, { w: number; h: number }>,
): void {
  for (const child of element.children) {
    if (child.tagName === "defs") continue;
    const placed = multiply(m, parseTransform(child.getAttribute("transform")));
    const target =
      child.tagName === "use" ? root.querySelector(`[id="${hrefOf(child).slice(1)}"]`) : child;
    if (target?.tagName === "image") {
      const w = Number(target.getAttribute("width")) * spread(placed, 1, 0);
      const h = Number(target.getAttribute("height")) * spread(placed, 0, 1);
      const known = sizes.get(hrefOf(target));
      sizes.set(hrefOf(target), { w: Math.max(w, known?.w ?? 0), h: Math.max(h, known?.h ?? 0) });
    } else measure(child, placed, root, sizes);
  }
}

function spread(m: PdfMatrix, x: number, y: number): number {
  const to = apply([m[0], m[1], m[2], m[3], 0, 0], { x, y });
  return Math.hypot(to.x, to.y);
}

async function embedImage(
  doc: PdfDocument,
  href: string,
  wanted: { w: number; h: number },
  quality: number,
  output: PdfColorOutput,
): Promise<number> {
  const image = new Image();
  image.src = href;
  await image.decode();
  const fit = (own: number, want: number) =>
    Math.max(1, Math.min(Math.ceil(own > 0 ? Math.min(own, want) : want), MAX_SIDE));
  const width = fit(image.naturalWidth, wanted.w);
  const height = fit(image.naturalHeight, wanted.h);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Couldn't draw a picture for the PDF.");
  context.drawImage(image, 0, 0, width, height);
  const { data } = context.getImageData(0, 0, width, height);
  return isOpaque(data)
    ? output.opaque(doc, canvas, quality)
    : output.translucent(doc, { data, width, height });
}

function isOpaque(rgba: Uint8ClampedArray): boolean {
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] !== 255) return false;
  return true;
}
