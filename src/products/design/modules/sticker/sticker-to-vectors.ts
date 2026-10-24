import { generateNKeysBetween } from "fractional-indexing";

import {
  booleanPaths,
  isSvg,
  mapPath,
  normalizePath,
  outlineStroke,
  placePath,
  readSvg,
  unionRects,
  type CanvasDocument,
  type PathOperand,
  type PathShape,
  type Point,
  type SvgDocument,
  type SvgLayer,
} from "@canvas";
import { createId } from "@shared/core";

import { pathToNetwork, solidPaint, type DesignNode, type NodeEffect } from "../core";
import { createGroup } from "../group";
import { createVector, type VectorElement } from "../vector";
import { openNetwork } from "./open-network";
import { svgPaint } from "./svg-paints";
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
 * Turns a sticker into a group of vectors, one per shape of its SVG, so each can be recolored:
 * its die-cut edge becomes an "Edge" vector under the art (the art's outline grown by the edge),
 * its soft shadow and outline become the group's effects. The group keeps the sticker's id, name,
 * place in the tree, opacity and effects. Call it in an undo step; returns the group's id, or
 * `null` when the picture isn't an SVG.
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

  const group = createGroup({ x: el.x, y: el.y, w: el.w, h: el.h }, el.name, el.index, el.parentId);
  const layers = svg.layers.flatMap((layer) => layerVector(layer, toWorld, place, scale, group.id));
  const edge = svg.edge ? edgeVector(svg, toWorld, scale, el.edgeColor, group.id) : null;
  const children = edge ? [edge, ...layers] : layers;
  if (children.length === 0) return null;
  const indexes = generateNKeysBetween(null, null, children.length);

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
  const bounds = unionRects(
    children.map((child) => ({ x: child.x, y: child.y, w: child.w, h: child.h })),
  );
  const host: DesignNode = {
    ...group,
    ...(bounds ?? {}),
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
  doc.add(host);
  children.forEach((child, i) => {
    const placed: VectorElement = {
      ...child,
      parentId: el.id,
      pageId: el.pageId,
      index: indexes[i] ?? child.index,
    };
    doc.add(placed);
  });
  return el.id;
}

/** One SVG shape as a vector: its fill area normalized (holes open), or its stroked lines. */
function layerVector(
  layer: SvgLayer,
  toWorld: (shape: PathShape) => PathShape,
  place: (p: Point) => Point,
  scale: number,
  parentId: string,
): VectorElement[] {
  const world = toWorld(layer.shape);
  const filled = layer.fill ? normalizePath(world, layer.fillRule) : null;
  const network =
    filled && filled.contours.length > 0
      ? pathToNetwork(filled)
      : layer.stroke
        ? openNetwork(world)
        : null;
  if (!network) return [];
  const vector = createVector(network, layer.name, "a0", parentId, { fills: [], strokes: [] });
  const box = { x: vector.x, y: vector.y, w: vector.w, h: vector.h };
  return [
    {
      ...vector,
      opacity: layer.opacity,
      fills: layer.fill && filled?.contours.length ? [svgPaint(layer.fill, box, place)] : [],
      strokes: layer.stroke ? [svgPaint(layer.stroke, box, place)] : [],
      strokeWeight: layer.strokeWidth * scale,
      strokeAlign: "center",
      strokeCap: layer.strokeCap === "butt" ? "none" : layer.strokeCap,
      strokeJoin: layer.strokeJoin,
    },
  ];
}

/** The die-cut edge as a vector: what the edged art covers, grown by the edge's width. */
function edgeVector(
  svg: SvgDocument,
  toWorld: (shape: PathShape) => PathShape,
  scale: number,
  edgeColor: string | null,
  parentId: string,
): VectorElement | null {
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
  if (grown.contours.length === 0) return null;
  return createVector(pathToNetwork(grown), "Edge", "a0", parentId, {
    fills: [solidPaint(edgeColor ?? edge.color)],
    strokes: [],
  });
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
