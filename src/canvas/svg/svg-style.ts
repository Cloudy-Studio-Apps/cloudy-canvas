import { clamp } from "../utils";
import { number } from "./svg-shapes";
import type { SvgStyle } from "./svg.types";

/** What the root starts with: SVG's initial values. */
export const INITIAL_STYLE: SvgStyle = {
  fill: "#000000",
  fillOpacity: 1,
  fillRule: "nonzero",
  stroke: "none",
  strokeOpacity: 1,
  strokeWidth: 1,
  strokeCap: "butt",
  strokeJoin: "miter",
  opacity: 1,
};

/** A property from the element's `style` attribute, else its presentation attribute. */
export function svgProperty(el: Element, name: string): string | null {
  const style = el.getAttribute("style");
  if (style) {
    for (const rule of style.split(";")) {
      const at = rule.indexOf(":");
      if (at > 0 && rule.slice(0, at).trim() === name) return rule.slice(at + 1).trim();
    }
  }
  return el.getAttribute(name);
}

/** The element's style: what it sets over what it inherits (`opacity` multiplies). */
export function elementStyle(el: Element, parent: SvgStyle): SvgStyle {
  const get = (name: string) => svgProperty(el, name);
  const fraction = (value: string | null, fallback: number) =>
    value === null ? fallback : clamp(number(value), 0, 1);
  const choice = <T extends string>(value: string | null, options: readonly T[], fallback: T) =>
    options.includes(value as T) ? (value as T) : fallback;
  const opacity = get("opacity");
  const width = get("stroke-width");
  return {
    fill: get("fill") ?? parent.fill,
    fillOpacity: fraction(get("fill-opacity"), parent.fillOpacity),
    fillRule: choice(get("fill-rule"), ["nonzero", "evenodd"], parent.fillRule),
    stroke: get("stroke") ?? parent.stroke,
    strokeOpacity: fraction(get("stroke-opacity"), parent.strokeOpacity),
    strokeWidth: width === null ? parent.strokeWidth : Math.max(0, number(width)),
    strokeCap: choice(get("stroke-linecap"), ["butt", "round", "square"], parent.strokeCap),
    strokeJoin: choice(get("stroke-linejoin"), ["miter", "round", "bevel"], parent.strokeJoin),
    opacity: parent.opacity * (opacity === null ? 1 : clamp(number(opacity), 0, 1)),
  };
}
