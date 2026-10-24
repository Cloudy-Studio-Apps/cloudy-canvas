import { parseCssColor, rgbaToHex } from "../gradient";
import { number } from "./svg-shapes";
import { svgProperty } from "./svg-style";
import type { SvgEdgeFilter } from "./svg.types";

/**
 * A filter that draws a die-cut edge, as the built-in stickers' does (`feMorphology` dilating the
 * alpha, flooded with a color, maybe a `feDropShadow`), or `null` for any other filter. `scale`
 * takes the filter's lengths to the file's user space.
 */
export function readEdgeFilter(filter: Element, scale: number): SvgEdgeFilter | null {
  const parts = [...filter.children];
  const find = (tag: string) => parts.find((part) => part.tagName.toLowerCase() === tag);
  const grow = find("femorphology");
  if (!grow || grow.getAttribute("operator") !== "dilate") return null;
  const flood = find("feflood");
  const color = hex(flood ? svgProperty(flood, "flood-color") : null, "#FFFFFF");
  const drop = find("fedropshadow");
  return {
    radius: number(grow.getAttribute("radius")) * scale,
    color,
    shadow: drop
      ? {
          dx: number(drop.getAttribute("dx")) * scale,
          dy: number(drop.getAttribute("dy")) * scale,
          blur: number(drop.getAttribute("stdDeviation")) * 2 * scale,
          color: hex(svgProperty(drop, "flood-color"), "#000000"),
          opacity: Number.parseFloat(svgProperty(drop, "flood-opacity") ?? "1") || 0,
        }
      : null,
  };
}

function hex(value: string | null, fallback: string): string {
  const rgba = value ? parseCssColor(value) : null;
  return rgba ? rgbaToHex({ ...rgba, a: 1 }) : fallback;
}
