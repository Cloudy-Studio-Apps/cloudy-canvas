import type { Point, Rect } from "../geometry.types";
import { applyAffine, parseCssColor, rgbaToHex, type ColorStop } from "../gradient";
import { clamp } from "../utils";
import { number } from "./svg-shapes";
import { svgProperty } from "./svg-style";
import { parseSvgTransform } from "./svg-transform";
import type { SvgGradient, SvgMatrix } from "./svg.types";

/**
 * The gradient `<linearGradient>`/`<radialGradient>` paints an element with, in the file's user
 * space: `box` is the element's own bounds (for `objectBoundingBox` units, the default) and
 * `ctm` takes its user space to the file's. Stops come from the gradient or the one it `href`s.
 */
export function readSvgGradient(
  gradient: Element,
  byId: (id: string) => Element | null,
  box: Rect,
  ctm: SvgMatrix,
): SvgGradient | null {
  const linear = gradient.tagName.toLowerCase() === "lineargradient";
  const stops = gradientStops(gradient, byId);
  if (stops.length === 0) return null;
  const attr = (name: string, fallback: number) => {
    const value = gradient.getAttribute(name);
    if (value === null) return fallback;
    return value.trim().endsWith("%") ? number(value) / 100 : number(value);
  };
  const userSpace = gradient.getAttribute("gradientUnits") === "userSpaceOnUse";
  const own = parseSvgTransform(gradient.getAttribute("gradientTransform"));
  const place = (p: Point): Point => {
    const q = applyAffine(own, p);
    const local = userSpace ? q : { x: box.x + q.x * box.w, y: box.y + q.y * box.h };
    return applyAffine(ctm, local);
  };
  if (linear) {
    const start = place({ x: attr("x1", 0), y: attr("y1", 0) });
    const end = place({ x: attr("x2", 1), y: attr("y2", 0) });
    return { type: "linear", stops, start, end, width: end };
  }
  const half = userSpace ? 0 : 0.5;
  const cx = attr("cx", half);
  const cy = attr("cy", half);
  const r = attr("r", half);
  return {
    type: "radial",
    stops,
    start: place({ x: cx, y: cy }),
    end: place({ x: cx + r, y: cy }),
    width: place({ x: cx, y: cy + r }),
  };
}

function gradientStops(gradient: Element, byId: (id: string) => Element | null): ColorStop[] {
  let source: Element | null = gradient;
  for (let depth = 0; source && depth < 8; depth++) {
    const stops = [...source.children].filter((child) => child.tagName.toLowerCase() === "stop");
    if (stops.length > 0) return stops.map(readStop);
    const href: string | null = source.getAttribute("href") ?? source.getAttribute("xlink:href");
    source = href?.startsWith("#") ? byId(href.slice(1)) : null;
  }
  return [];
}

function readStop(stop: Element): ColorStop {
  const offset = stop.getAttribute("offset") ?? "0";
  const position = clamp(offset.trim().endsWith("%") ? number(offset) / 100 : number(offset), 0, 1);
  const rgba = parseCssColor(svgProperty(stop, "stop-color") ?? "#000000");
  const opacity = svgProperty(stop, "stop-opacity");
  return {
    position,
    color: rgba ? rgbaToHex({ ...rgba, a: 1 }) : "#000000",
    opacity: clamp((rgba?.a ?? 1) * (opacity === null ? 1 : number(opacity)), 0, 1),
  };
}
