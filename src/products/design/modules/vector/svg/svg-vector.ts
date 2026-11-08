import {
  fitInView,
  mapPath,
  normalizePath,
  outlineStroke,
  type PathShape,
  type Rect,
  type SvgDocument,
  type SvgLayer,
} from "@canvas";

import {
  mergeNetworks,
  networkBounds,
  pathToNetwork,
  type Paint,
  type VectorNetwork,
} from "../../core";
import { createVector } from "../vector.factory";
import type { VectorElement } from "../vector.types";
import { svgPaint } from "./svg-paint";
import type { SvgArea, SvgPlacement } from "./svg-vector.types";

/** How much of the view a large pasted SVG may cover, as images. */
const FIT_IN_VIEW = 0.8;

/**
 * An SVG's shapes as one network in the world, as Figma's vectors from SVGs: each shape's fill an
 * area with that fill, each stroke the area it covers with the stroke's paint, bottom to top.
 * `under` adds areas below them (a sticker's die-cut edge). `null` when it draws nothing.
 */
export function svgNetwork(
  svg: SvgDocument,
  placement: SvgPlacement,
  under: readonly { shape: PathShape; paint: Paint }[] = [],
): VectorNetwork | null {
  const areas = svg.layers.flatMap((layer) => layerAreas(layer, placement));
  const parts = [
    ...under.map(({ shape }) => pathToNetwork(shape)),
    ...areas.map(({ shape }) => pathToNetwork(shape)),
  ];
  const merged = mergeNetworks(parts);
  if (merged.regions.length === 0) return null;
  const box = networkBounds(merged);
  const paints = [
    ...under.map(({ paint }) => paint),
    ...areas.map(({ paint, opacity }) => {
      const converted = svgPaint(paint, box, placement.place);
      return { ...converted, opacity: converted.opacity * opacity };
    }),
  ];
  // Each part's regions take its paint.
  let region = 0;
  const regions = parts.flatMap((part, i) =>
    part.regions.map(() => {
      const own = merged.regions[region++]!;
      const paint = paints[i];
      return paint ? { ...own, fills: [paint] } : own;
    }),
  );
  return { ...merged, regions };
}

/** A pasted or dropped SVG as one vector, fit and centered in `view` (as images are). */
export function svgToVector(
  svg: SvgDocument,
  view: Rect,
  index: string,
  name: string,
): VectorElement | null {
  const { viewBox } = svg;
  const size = { w: Math.max(viewBox.w, 1), h: Math.max(viewBox.h, 1) };
  const rect = fitInView(size, view, FIT_IN_VIEW);
  const scale = rect.w / size.w;
  const place = (p: { x: number; y: number }) => ({
    x: rect.x + (p.x - viewBox.x) * scale,
    y: rect.y + (p.y - viewBox.y) * scale,
  });
  const network = svgNetwork(svg, { toWorld: (shape) => mapPath(shape, place), place, scale });
  if (!network) return null;
  return createVector(network, name, index, null, { fills: [], strokes: [] });
}

function layerAreas(layer: SvgLayer, { toWorld, scale }: SvgPlacement): SvgArea[] {
  const world = toWorld(layer.shape);
  const areas: SvgArea[] = [];
  if (layer.fill) {
    const filled = normalizePath(world, layer.fillRule);
    if (filled.contours.length > 0) {
      areas.push({ shape: filled, paint: layer.fill, opacity: layer.opacity });
    }
  }
  if (layer.stroke && layer.strokeWidth > 0) {
    const width = layer.strokeWidth * scale;
    const outline = outlineStroke(world, { width, cap: layer.strokeCap, join: layer.strokeJoin });
    const covered = normalizePath(outline, "nonzero");
    if (covered.contours.length > 0) {
      areas.push({ shape: covered, paint: layer.stroke, opacity: layer.opacity });
    }
  }
  return areas;
}
