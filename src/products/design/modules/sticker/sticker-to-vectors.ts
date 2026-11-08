import {
  booleanPaths,
  isSvg,
  mapPath,
  outlineStroke,
  placePath,
  readSvg,
  type CanvasDocument,
  type PathOperand,
  type PathShape,
  type Point,
  type SvgDocument,
} from "@canvas";
import { createId } from "@shared/core";

import { solidPaint, type NodeEffect } from "../core";
import { createVector, svgNetwork, type VectorElement } from "../vector";
import type { StickerNodeElement } from "./sticker.types";

/** The sticker's picture as SVG layers, or `null` when it's a raster picture. */
export function stickerSvg(doc: CanvasDocument, el: StickerNodeElement): SvgDocument | null {
  const data = doc.getAsset(el.assetId);
  if (!data || !isSvg(data)) return null;
  const svg = readSvg(new TextDecoder().decode(data));
  return svg && svg.layers.length > 0 ? svg : null;
}

/**
 * Whether "Convert to vectors" can turn this sticker into layers: its picture is an SVG (only its
 * start is read, so panels can ask on every render).
 */
export function canConvertSticker(doc: CanvasDocument, el: StickerNodeElement): boolean {
  const data = doc.getAsset(el.assetId);
  return data !== undefined && data !== null && isSvg(data);
}

/**
 * Turns a sticker into one vector, as Figma makes an SVG: each shape of its SVG an area with its
 * own paint (a stroke the area it covers), so each can be recolored; its die-cut edge is the
 * bottom area (the art's outline grown by the edge), its soft shadow and outline become the
 * vector's effects. The vector keeps the sticker's id, name, place in the tree, opacity and
 * effects. Call it in an undo step; returns its id, or `null` when the picture isn't an SVG.
 */
export function stickerToVectors(doc: CanvasDocument, el: StickerNodeElement): string | null {
  const svg = stickerSvg(doc, el);
  if (!svg) return null;
  const { viewBox } = svg;
  // The picture is fitted in the box, centered (as an image paint's `fit`).
  const scale = Math.min(el.w / viewBox.w, el.h / viewBox.h);
  const dx = (el.w - viewBox.w * scale) / 2 - viewBox.x * scale;
  const dy = (el.h - viewBox.h * scale) / 2 - viewBox.y * scale;
  const toWorld = (shape: PathShape) =>
    placePath(
      mapPath(shape, (p) => ({ x: p.x * scale + dx, y: p.y * scale + dy })),
      el,
    );
  const place = (p: Point): Point =>
    toWorld({ contours: [{ start: p, segments: [], closed: false }] }).contours[0]?.start ?? p;

  const edge = svg.edge ? edgeShape(svg, toWorld, scale) : null;
  const under = edge
    ? [{ shape: edge, paint: solidPaint(el.edgeColor ?? svg.edge?.color ?? "#FFFFFF") }]
    : [];
  const network = svgNetwork(svg, { toWorld, place, scale }, under);
  if (!network) return null;

  const effects: NodeEffect[] = [];
  if (el.outline?.visible && el.outline.width > 0) {
    effects.push(shadow(el.outline.color, 1, 0, 0, 0, el.outline.width));
  }
  const cast = svg.edge?.shadow;
  if (cast) {
    effects.push(
      shadow(cast.color, cast.opacity, cast.dx * scale, cast.dy * scale, cast.blur * scale, 0),
    );
  }
  const vector = createVector(network, el.name, el.index, el.parentId, { fills: [], strokes: [] });
  const placed: VectorElement = {
    ...vector,
    id: el.id,
    pageId: el.pageId,
    visible: el.visible,
    opacity: el.opacity,
    blendMode: el.blendMode,
    effects: [...effects, ...el.effects],
    sizing: el.sizing,
    layoutAbsolute: el.layoutAbsolute,
    ...(el.locked ? { locked: true } : {}),
  };
  doc.remove([el.id]);
  doc.add(placed);
  return el.id;
}

/** The die-cut edge's area: what the edged art covers, grown by the edge's width. */
function edgeShape(
  svg: SvgDocument,
  toWorld: (shape: PathShape) => PathShape,
  scale: number,
): PathShape | null {
  const edge = svg.edge;
  if (!edge) return null;
  const operands: PathOperand[] = [];
  for (const layer of svg.layers) {
    if (!layer.edged) continue;
    const world = toWorld(layer.shape);
    if (layer.fill) operands.push({ shape: world, fillRule: layer.fillRule });
    if (layer.stroke && layer.strokeWidth > 0) {
      const cap = layer.strokeCap;
      operands.push({
        shape: outlineStroke(world, {
          width: layer.strokeWidth * scale,
          cap,
          join: layer.strokeJoin,
        }),
        fillRule: "nonzero",
      });
    }
  }
  if (operands.length === 0) return null;
  const art = booleanPaths("union", operands);
  const ring = outlineStroke(art, { width: edge.radius * scale * 2, join: "round", cap: "round" });
  const grown = booleanPaths("union", [
    { shape: art, fillRule: "nonzero" },
    { shape: ring, fillRule: "nonzero" },
  ]);
  return grown.contours.length > 0 ? grown : null;
}

function shadow(
  color: string,
  opacity: number,
  x: number,
  y: number,
  blur: number,
  spread: number,
): NodeEffect {
  return {
    id: createId(),
    type: "drop-shadow",
    visible: true,
    color,
    opacity,
    x,
    y,
    blur,
    spread,
    showBehind: false,
  };
}
