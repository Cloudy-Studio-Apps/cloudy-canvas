import type { PdfColorOutput } from "./color";
import { pdfNumber } from "./pdf-matrix";
import type { PdfDocument } from "./pdf-document";

/** Between stops at the same place: a hard edge, as near as PDF's bounds allow. */
const EPSILON = 1e-4;

/** A `<linearGradient>` or `<radialGradient>` as a shading, in the gradient's own space. */
export function gradientShading(
  doc: PdfDocument,
  gradient: Element,
  output: PdfColorOutput,
): number {
  const radial = gradient.tagName === "radialGradient";
  const type = radial ? 3 : 2;
  const coords = radial ? "0.5 0.5 0 0.5 0.5 0.5" : "0 0 1 0";
  return doc.add(
    `<< /ShadingType ${type} /ColorSpace /${output.space} /Coords [${coords}] ` +
      `/Function ${stopsFunction(gradient, output)} /Extend [true true] >>`,
  );
}

function stopsFunction(gradient: Element, output: PdfColorOutput): string {
  const given = [...gradient.querySelectorAll("stop")].map((stop) => ({
    offset: Number(stop.getAttribute("offset") ?? 0),
    color: stop.getAttribute("stop-color") ?? "#000000",
  }));
  const stops = output.stops(given.length > 0 ? given : [{ offset: 0, color: "#000000" }]);
  const [first] = stops;
  const last = stops.at(-1);
  if (!first || !last) return "null";
  // The ends reach 0 and 1, and each stop sits past the one before it.
  const all = [{ ...first, offset: 0 }, ...stops, { ...last, offset: 1 }];
  const pieces = all.slice(1).map((stop, i) => ramp(all[i]!.color, stop.color));
  const bounds: number[] = [];
  let at = 0;
  for (const stop of all.slice(1, -1)) {
    at = Math.min(Math.max(stop.offset, at + EPSILON), 1 - EPSILON * (all.length - bounds.length));
    bounds.push(at);
  }
  return (
    `<< /FunctionType 3 /Domain [0 1] /Functions [${pieces.join(" ")}] ` +
    `/Bounds [${bounds.map(pdfNumber).join(" ")}] ` +
    `/Encode [${pieces.map(() => "0 1").join(" ")}] >>`
  );
}

function ramp(from: string, to: string): string {
  return `<< /FunctionType 2 /Domain [0 1] /C0 [${from}] /C1 [${to}] /N 1 >>`;
}
