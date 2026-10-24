import {
  applyAffine,
  IDENTITY_TRANSFORM,
  multiplyAffine,
  parseCssColor,
  rgbaToHex,
} from "../gradient";
import type { Rect } from "../geometry.types";
import { mapPath, pathBounds, type PathShape } from "../path";
import { readEdgeFilter } from "./svg-filter";
import { readSvgGradient } from "./svg-gradient";
import { number, svgElementShape } from "./svg-shapes";
import { elementStyle, INITIAL_STYLE, svgProperty } from "./svg-style";
import { matrixScale, parseSvgTransform } from "./svg-transform";
import type {
  SvgDocument,
  SvgEdgeFilter,
  SvgLayer,
  SvgMatrix,
  SvgPaint,
  SvgStyle,
} from "./svg.types";

/** Elements that hold others and are walked into. */
const CONTAINERS = new Set(["svg", "g", "a", "switch"]);
/** Elements that draw nothing themselves. */
const SILENT = new Set([
  "defs",
  "title",
  "desc",
  "metadata",
  "style",
  "lineargradient",
  "radialgradient",
  "filter",
  "clippath",
  "mask",
  "pattern",
  "symbol",
  "marker",
]);

/**
 * An SVG file as layers of cubic outlines with their paints, bottom to top, in its user space
 * (transforms applied): paths and the basic shapes, solid colors and linear/radial gradients,
 * strokes, opacity, and a die-cut edge filter (the built-in stickers'). Text, images, `<use>`,
 * clip paths and masks are skipped and counted. `null` when it isn't SVG.
 */
export function readSvg(markup: string): SvgDocument | null {
  const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
  const root = parsed.documentElement;
  if (root.tagName.toLowerCase() !== "svg" || parsed.getElementsByTagName("parsererror").length) {
    return null;
  }
  const byId = (id: string) => parsed.getElementById(id);
  const doc: SvgDocument = { viewBox: viewBoxOf(root), layers: [], edge: null, skipped: 0 };

  const walk = (el: Element, ctm: SvgMatrix, parent: SvgStyle, edged: boolean) => {
    const tag = el.tagName.toLowerCase();
    if (SILENT.has(tag)) return;
    if (svgProperty(el, "display") === "none") return;
    const matrix =
      tag === "svg" ? ctm : multiplyAffine(ctm, parseSvgTransform(el.getAttribute("transform")));
    const style = elementStyle(el, parent);
    const inEdge = edged || startsEdge(el, matrix, byId, doc);
    if (CONTAINERS.has(tag)) {
      for (const child of el.children) walk(child, matrix, style, inEdge);
      return;
    }
    const local = svgElementShape(el);
    if (!local) {
      doc.skipped++;
      return;
    }
    const box = boundsOf(local);
    const paint = (value: string, opacity: number): SvgPaint | null =>
      readPaint(value, opacity, byId, box, matrix);
    const layer: SvgLayer = {
      name: el.getAttribute("id") ?? tag,
      shape: mapPath(local, (p) => applyAffine(matrix, p)),
      fill: tag === "line" || tag === "polyline" ? null : paint(style.fill, style.fillOpacity),
      fillRule: style.fillRule,
      stroke: style.strokeWidth > 0 ? paint(style.stroke, style.strokeOpacity) : null,
      strokeWidth: style.strokeWidth * matrixScale(matrix),
      strokeCap: style.strokeCap,
      strokeJoin: style.strokeJoin,
      opacity: style.opacity,
      edged: inEdge,
    };
    if (layer.fill || layer.stroke) doc.layers.push(layer);
  };

  walk(root, IDENTITY_TRANSFORM, INITIAL_STYLE, false);
  return doc;
}

/** Whether `el` applies the die-cut edge filter (remembered on the document, the first one). */
function startsEdge(
  el: Element,
  ctm: SvgMatrix,
  byId: (id: string) => Element | null,
  doc: SvgDocument,
): boolean {
  const id = /url\(\s*#([^)\s]+)\s*\)/.exec(svgProperty(el, "filter") ?? "")?.[1];
  const filter = id ? byId(id) : null;
  const edge: SvgEdgeFilter | null = filter ? readEdgeFilter(filter, matrixScale(ctm)) : null;
  if (!edge) return false;
  doc.edge ??= edge;
  return true;
}

function readPaint(
  value: string,
  opacity: number,
  byId: (id: string) => Element | null,
  box: Rect,
  ctm: SvgMatrix,
): SvgPaint | null {
  const text = value.trim();
  if (text === "none" || opacity <= 0) return null;
  const ref = /^url\(\s*#([^)\s]+)\s*\)/.exec(text)?.[1];
  if (ref) {
    const target = byId(ref);
    const tag = target?.tagName.toLowerCase();
    if (!target || (tag !== "lineargradient" && tag !== "radialgradient")) return null;
    const gradient = readSvgGradient(target, byId, box, ctm);
    return gradient ? { kind: "gradient", gradient, opacity } : null;
  }
  const rgba = parseCssColor(text === "currentColor" ? "#000000" : text);
  if (!rgba || rgba.a <= 0) return null;
  return { kind: "color", color: rgbaToHex({ ...rgba, a: 1 }), opacity: opacity * rgba.a };
}

function boundsOf(shape: PathShape): Rect {
  return pathBounds(shape) ?? { x: 0, y: 0, w: 0, h: 0 };
}

function viewBoxOf(root: Element): Rect {
  const values = (root.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  const [x = 0, y = 0, w = 0, h = 0] = values;
  if (values.length === 4 && w > 0 && h > 0) return { x, y, w, h };
  return {
    x: 0,
    y: 0,
    w: number(root.getAttribute("width")) || 100,
    h: number(root.getAttribute("height")) || 100,
  };
}
