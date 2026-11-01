import type { PdfDocument } from "../pdf-document";
import type { PdfPixels } from "./pdf-color-output.types";

const imageDict = ({ width, height }: { width: number; height: number }) =>
  `/Type /XObject /Subtype /Image /Width ${width} /Height ${height} /BitsPerComponent 8`;

/** Embeds a JPEG file as it is; `decode` is its `/Decode` array, if it needs one. */
export function embedJpeg(
  doc: PdfDocument,
  jpeg: Uint8Array,
  size: { width: number; height: number },
  space: string,
  decode = "",
): number {
  return doc.stream(`${imageDict(size)} /ColorSpace /${space}${decode} /Filter /DCTDecode`, jpeg);
}

/** Embeds compressed samples in `space` with a compressed soft mask. */
export function embedFlate(
  doc: PdfDocument,
  size: { width: number; height: number },
  space: string,
  samples: Uint8Array,
  alpha: Uint8Array,
): number {
  const dict = imageDict(size);
  const mask = doc.stream(`${dict} /ColorSpace /DeviceGray /Filter /FlateDecode`, alpha);
  return doc.stream(
    `${dict} /ColorSpace /${space} /SMask ${mask} 0 R /Filter /FlateDecode`,
    samples,
  );
}

/** RGBA split into RGB and alpha. */
export function splitAlpha({ data, width, height }: PdfPixels): {
  colors: Uint8Array;
  alpha: Uint8Array;
} {
  const colors = new Uint8Array(width * height * 3);
  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < alpha.length; i++) {
    colors[i * 3] = data[i * 4]!;
    colors[i * 3 + 1] = data[i * 4 + 1]!;
    colors[i * 3 + 2] = data[i * 4 + 2]!;
    alpha[i] = data[i * 4 + 3]!;
  }
  return { colors, alpha };
}
