import { zlibSync } from "fflate";

import { canvasBlob } from "../../canvas-blob";
import type { PdfDocument } from "../pdf-document";
import { pdfNumber } from "../pdf-matrix";
import { embedFlate, embedJpeg, splitAlpha } from "./pdf-image-stream";
import type { PdfColorOutput } from "./pdf-color-output.types";

/** `#rrggbb` as PDF's three components. */
function rgbOf(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255]
    .map((channel) => pdfNumber(channel / 255))
    .join(" ");
}

/** Screen colors: what a PDF is written in unless it's going to press. */
export const RGB_OUTPUT: PdfColorOutput = {
  space: "DeviceRGB",
  paint: (hex, stroke) => `${rgbOf(hex)} ${stroke ? "RG" : "rg"}`,
  stops: (stops) => stops.map(({ offset, color }) => ({ offset, color: rgbOf(color) })),
  async opaque(doc: PdfDocument, canvas, quality) {
    const jpeg = await canvasBlob(canvas, "image/jpeg", quality);
    return embedJpeg(doc, new Uint8Array(await jpeg.arrayBuffer()), canvas, "DeviceRGB");
  },
  async translucent(doc, pixels) {
    const { colors, alpha } = splitAlpha(pixels);
    return embedFlate(doc, pixels, "DeviceRGB", zlibSync(colors), zlibSync(alpha));
  },
};
