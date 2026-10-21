/** PDF points per world unit (CSS pixels are 0.75pt). */
const POINTS_PER_UNIT = 0.75;
/** The largest page side PDF readers accept, in points. */
const MAX_PAGE_POINTS = 14400;

/**
 * A one-page PDF showing a JPEG image. `width` and `height` are the page size in world units, and
 * the image's pixel size is `pixels`. Written by hand: the image is embedded as is (DCTDecode).
 */
export function encodePdf(
  jpeg: Uint8Array,
  pixels: { width: number; height: number },
  size: { width: number; height: number },
): Blob {
  const fit = Math.min(
    1,
    MAX_PAGE_POINTS / (size.width * POINTS_PER_UNIT),
    MAX_PAGE_POINTS / (size.height * POINTS_PER_UNIT),
  );
  const w = round(size.width * POINTS_PER_UNIT * fit);
  const h = round(size.height * POINTS_PER_UNIT * fit);
  const content = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;

  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const write = (part: string | Uint8Array) => {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (body: string) => {
    offsets.push(length);
    write(`${offsets.length} 0 obj\n${body}\nendobj\n`);
  };

  write("%PDF-1.4\n");
  object("<< /Type /Catalog /Pages 2 0 R >>");
  object("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] ` +
      "/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>",
  );
  offsets.push(length);
  write(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pixels.width} /Height ${pixels.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  write(jpeg);
  write("\nendstream\nendobj\n");
  object(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = length;
  const entries = offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`);
  write(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n${entries.join("")}`);
  write(`trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks as Uint8Array<ArrayBuffer>[], { type: "application/pdf" });
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
