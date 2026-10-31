import type { Rect } from "../../geometry.types";
import { hexOf, num } from "./svg-format";
import type { SvgDefs } from "./svg-defs";

/** The whole file: what `rect` shows of `body`, over `background` when there is one. */
export function svgDocument(
  rect: Rect,
  background: number | null,
  defs: SvgDefs,
  body: string,
): string {
  const { x, y, w, h } = rect;
  const backdrop =
    background === null
      ? ""
      : `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="${hexOf(background)}"/>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `width="${num(w)}" height="${num(h)}" viewBox="${num(x)} ${num(y)} ${num(w)} ${num(h)}">` +
    `${defs.toString()}${backdrop}${body}</svg>\n`
  );
}
