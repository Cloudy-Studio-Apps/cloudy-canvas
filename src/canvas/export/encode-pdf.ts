import type { PdfOptions, PdfPage } from "./encode-pdf.types";

/** PDF points per world unit by default (CSS pixels are 0.75pt). */
const POINTS_PER_UNIT = 0.75;
/** The largest page side PDF readers accept, in points. */
const MAX_PAGE_POINTS = 14400;

/**
 * A one-page PDF showing a JPEG image. `width` and `height` are the page size in world units, and
 * the image's pixel size is `pixels`.
 */
export function encodePdf(
  jpeg: Uint8Array,
  pixels: { width: number; height: number },
  size: { width: number; height: number },
): Blob {
  return encodePdfPages([{ image: { jpeg, pixels }, size }]);
}

/**
 * A PDF with one page per JPEG image, each filling its page, in order (a page without an image is
 * blank). Written by hand: the images are embedded as they are (DCTDecode).
 */
export function encodePdfPages(pages: readonly PdfPage[], options: PdfOptions = {}): Blob {
  const pointsPerUnit = options.pointsPerUnit ?? POINTS_PER_UNIT;
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const write = (part: string | Uint8Array) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const begin = (id: number) => {
    offsets[id - 1] = length;
    write(`${id} 0 obj\n`);
  };
  const object = (id: number, body: string) => {
    begin(id);
    write(`${body}\nendobj\n`);
  };

  // Objects: 1 the catalog, 2 the page tree, then per page its page, image and contents.
  const pageId = (i: number) => 3 + i * 3;
  write("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  const kids = pages.map((_, i) => `${pageId(i)} 0 R`).join(" ");
  object(2, `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  pages.forEach((page, i) => {
    const id = pageId(i);
    const { w, h } = pageSize(page.size, pointsPerUnit);
    const { image } = page;
    const content = image ? `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q` : "";
    const resources = image ? `/Resources << /XObject << /Im0 ${id + 1} 0 R >> >> ` : "";
    object(
      id,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ${resources}/Contents ${id + 2} 0 R >>`,
    );
    if (image) {
      begin(id + 1);
      write(
        `<< /Type /XObject /Subtype /Image /Width ${image.pixels.width} ` +
          `/Height ${image.pixels.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 ` +
          `/Filter /DCTDecode /Length ${image.jpeg.length} >>\nstream\n`,
      );
      write(image.jpeg);
      write("\nendstream\nendobj\n");
    } else {
      // Every page keeps three object numbers, so a blank one's image is an empty object.
      object(id + 1, "null");
    }
    object(id + 2, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  const xref = length;
  const entries = offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`);
  write(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${entries.join("")}`);
  write(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks as Uint8Array<ArrayBuffer>[], { type: "application/pdf" });
}

/** A page's size in points, shrunk to what PDF readers accept. */
function pageSize(
  size: { width: number; height: number },
  pointsPerUnit: number,
): { w: number; h: number } {
  const fit = Math.min(
    1,
    MAX_PAGE_POINTS / (size.width * pointsPerUnit),
    MAX_PAGE_POINTS / (size.height * pointsPerUnit),
  );
  return {
    w: round(size.width * pointsPerUnit * fit),
    h: round(size.height * pointsPerUnit * fit),
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
