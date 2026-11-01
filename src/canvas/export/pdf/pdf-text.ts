import { pdfNumber } from "./pdf-matrix";
import type { PdfDocument } from "./pdf-document";

/** How wide each character counts as, in thousandths of the size: runs are then stretched to fit. */
const CHAR_WIDTH = 500;
const FIRST_CHAR = 32;
const LAST_CHAR = 255;

/**
 * The font of the hidden text layer: never seen, it only gives the text something to search and
 * copy. Every character is one width, so a run is stretched to the exact width of its outlines.
 */
export function hiddenFont(doc: PdfDocument): number {
  const widths = new Array<number>(LAST_CHAR - FIRST_CHAR + 1).fill(CHAR_WIDTH).join(" ");
  return doc.add(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding ` +
      `/FirstChar ${FIRST_CHAR} /LastChar ${LAST_CHAR} /Widths [${widths}] >>`,
  );
}

/**
 * The operators of a hidden run, on its baseline and as wide as its outlines; empty for text
 * outside Latin characters, which the font can't hold (it stays outlines only).
 */
export function hiddenTextOps(
  font: string,
  text: string,
  x: number,
  baseline: number,
  size: number,
  width: number,
): string {
  const chars = [...text].map((char) => char.charCodeAt(0));
  if (chars.length === 0 || size <= 0 || chars.some((c) => c < FIRST_CHAR || c > LAST_CHAR)) {
    return "";
  }
  const stretch = (width / (chars.length * (CHAR_WIDTH / 1000) * size)) * 100;
  const string = chars.map((c) => `\\${c.toString(8).padStart(3, "0")}`).join("");
  return (
    `BT 3 Tr /${font} ${pdfNumber(size)} Tf ${pdfNumber(stretch)} Tz ` +
    `1 0 0 -1 ${pdfNumber(x)} ${pdfNumber(baseline)} Tm (${string}) Tj ET`
  );
}
