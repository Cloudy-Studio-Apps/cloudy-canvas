import type { Point } from "../../geometry.types";
import { apply, pdfNumber } from "./pdf-matrix";
import type { PdfMatrix } from "./pdf-writer.types";

const COMMANDS = /([MLQCZ])([^MLQCZ]*)/g;

/** Path data as the SVG writer makes it (`M L Q C Z`, absolute) as PDF path operators. */
export function pathOps(d: string, m: PdfMatrix): string {
  const ops: string[] = [];
  const point = (x: number, y: number) => {
    const p = apply(m, { x, y });
    return `${pdfNumber(p.x)} ${pdfNumber(p.y)}`;
  };
  let at: Point = { x: 0, y: 0 };
  for (const [, command, args] of d.matchAll(COMMANDS)) {
    const n = (args ?? "").trim().split(/\s+/).filter(Boolean).map(Number);
    const [a = 0, b = 0, c = 0, e = 0, g = 0, h = 0] = n;
    if (command === "M") ops.push(`${point(a, b)} m`);
    else if (command === "L") ops.push(`${point(a, b)} l`);
    else if (command === "C") ops.push(`${point(a, b)} ${point(c, e)} ${point(g, h)} c`);
    else if (command === "Z") ops.push("h");
    else {
      // PDF has only cubics: a quadratic's handles, two thirds of the way to its control point.
      const c1 = point(at.x + ((a - at.x) * 2) / 3, at.y + ((b - at.y) * 2) / 3);
      const c2 = point(c + ((a - c) * 2) / 3, e + ((b - e) * 2) / 3);
      ops.push(`${c1} ${c2} ${point(c, e)} c`);
    }
    if (command === "C") at = { x: g, y: h };
    else if (command === "Q") at = { x: c, y: e };
    else if (command !== "Z") at = { x: a, y: b };
  }
  return ops.join(" ");
}

/** A rect as PDF path operators, through `m`. */
export function rectOps(x: number, y: number, w: number, h: number, m: PdfMatrix): string {
  return pathOps(`M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}L${x} ${y + h}Z`, m);
}
