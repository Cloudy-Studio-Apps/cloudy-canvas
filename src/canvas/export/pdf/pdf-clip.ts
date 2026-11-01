import { apply, IDENTITY, invert, multiply, parseTransform, pdfNumber } from "./pdf-matrix";
import { pathOps, rectOps } from "./pdf-path";
import type { PdfMatrix } from "./pdf-writer.types";

export function attr(el: Element, name: string): string {
  return el.getAttribute(name) ?? "";
}

export function rectOf(el: Element, m: PdfMatrix): string {
  const read = (name: string) => Number(el.getAttribute(name) ?? 0);
  return rectOps(read("x"), read("y"), read("width"), read("height"), m);
}

/** A `<clipPath>` as operators: what it holds, through the transforms inside it. */
export function clipOps(clip: Element): string {
  const shapes: string[] = [];
  let evenOdd = false;
  const visit = (el: Element, m: PdfMatrix) => {
    for (const child of el.children) {
      const placed = multiply(m, parseTransform(child.getAttribute("transform")));
      if (child.tagName === "path") shapes.push(pathOps(attr(child, "d"), placed));
      else if (child.tagName === "rect") shapes.push(rectOf(child, placed));
      else visit(child, placed);
      evenOdd ||= child.getAttribute("clip-rule") === "evenodd";
    }
  };
  visit(clip, IDENTITY);
  if (shapes.length === 0) return "0 0 0 0 re W n";
  return `${shapes.join(" ")} ${evenOdd ? "W*" : "W"} n`;
}

/** The page's box in a form's own space, which is all of it that can show. */
export function formBox(page: PdfMatrix): string {
  // A page has no fixed size here: this reaches past any page, then the viewer cuts it.
  const inverse = invert(page);
  const corners = [
    { x: -14400, y: -14400 },
    { x: 14400, y: -14400 },
    { x: 14400, y: 14400 },
    { x: -14400, y: 14400 },
  ].map((corner) => apply(inverse, corner));
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]
    .map(pdfNumber)
    .join(" ");
}
