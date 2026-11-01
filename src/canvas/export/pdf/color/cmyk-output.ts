import { zlibSync } from "fflate";

import type { ColorConverter } from "@shared/core";

import { cmykJpeg } from "../../cmyk-jpeg";
import { pdfNumber } from "../pdf-matrix";
import { embedFlate, embedJpeg, splitAlpha } from "./pdf-image-stream";
import type {
  PdfColorOutput,
  PdfGradientStop,
  PdfOutputStop,
  PdfPixels,
} from "./pdf-color-output.types";

const PURE_BLACK = "#000000";
const PAPER = "#ffffff";
/** Steps of a blend between two stops: inks between two colors don't follow the screen's line. */
const GRADIENT_STEPS = 8;
/** Pixels converted at a go, giving the UI a turn between them. */
const PIXEL_BATCH = 1 << 20;
const INVERTED_DECODE = " /Decode [1 0 1 0 1 0 1 0]";

const channels = (hex: string): [number, number, number] => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [value >> 16, (value >> 8) & 255, value & 255];
};

const hexOf = (r: number, g: number, b: number) =>
  `#${((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1)}`;

/**
 * A press's colors: everything goes through `converter`. Black stays black ink alone and paper no
 * ink at all, whatever the profile would mix for them, or text would print on four plates.
 */
export function cmykOutput(converter: ColorConverter): PdfColorOutput {
  const known = new Map<string, string>([
    [PURE_BLACK, "0 0 0 1"],
    [PAPER, "0 0 0 0"],
  ]);
  const inks = (hex: string): string => {
    let ink = known.get(hex);
    if (!ink) {
      const cmyk = converter.rgbToCmyk(Uint8Array.from(channels(hex)));
      ink = [...cmyk].map((value) => pdfNumber(value / 255)).join(" ");
      known.set(hex, ink);
    }
    return ink;
  };

  const toCmyk = async (rgb: Uint8Array): Promise<Uint8Array> => {
    const cmyk = new Uint8Array((rgb.length / 3) * 4);
    for (let at = 0; at * 3 < rgb.length; at += PIXEL_BATCH) {
      const part = rgb.subarray(at * 3, (at + PIXEL_BATCH) * 3);
      cmyk.set(converter.rgbToCmyk(part), at * 4);
      await new Promise((resolve) => setTimeout(resolve));
    }
    return cmyk;
  };

  return {
    space: "DeviceCMYK",
    registration: "1 1 1 1 K",
    paint: (hex, stroke) => `${inks(hex)} ${stroke ? "K" : "k"}`,
    overprints: (hex) => hex === PURE_BLACK,
    stops: (stops) => blendedStops(stops, inks),
    async opaque(doc, canvas, quality) {
      const { width, height } = canvas;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Couldn't read a picture for the PDF.");
      const { data } = context.getImageData(0, 0, width, height);
      const cmyk = await toCmyk(splitAlpha({ data, width, height }).colors);
      const jpeg = await cmykJpeg(cmyk, width, height, quality);
      return embedJpeg(doc, jpeg, { width, height }, "DeviceCMYK", INVERTED_DECODE);
    },
    async translucent(doc, pixels: PdfPixels) {
      const { colors, alpha } = splitAlpha(pixels);
      const cmyk = await toCmyk(colors);
      return embedFlate(doc, pixels, "DeviceCMYK", zlibSync(cmyk), zlibSync(alpha));
    },
  };
}

/** A gradient's stops with steps between them, each converted, so the print follows the screen. */
function blendedStops(
  stops: readonly PdfGradientStop[],
  inks: (hex: string) => string,
): PdfOutputStop[] {
  const out: PdfOutputStop[] = [];
  stops.forEach((stop, i) => {
    const next = stops[i + 1];
    if (!next) {
      out.push({ offset: stop.offset, color: inks(stop.color) });
      return;
    }
    const from = channels(stop.color);
    const to = channels(next.color);
    for (let step = 0; step < GRADIENT_STEPS; step++) {
      const t = step / GRADIENT_STEPS;
      const [r, g, b] = from.map((value, c) => value + (to[c]! - value) * t) as [
        number,
        number,
        number,
      ];
      out.push({
        offset: stop.offset + (next.offset - stop.offset) * t,
        color: inks(hexOf(r, g, b)),
      });
    }
  });
  return out;
}
