import type { Graphics } from "pixi.js";

import type { MaskScopeView } from "../layers/mask-scope-view";
import { num } from "./svg-format";
import type { SvgContext } from "./svg-context.types";
import { graphicsOutlines } from "./write-graphics";

/** A `clip-path` attribute of what `mask` fills, or `null` when it can't be written. */
export function clipAttr(mask: Graphics, w: SvgContext): string | null {
  mask.updateLocalTransform();
  const outlines = graphicsOutlines(mask, mask.localTransform);
  if (!outlines) return null;
  const id = w.defs.id("c");
  const paths = outlines.map(({ d, evenOdd }) =>
    evenOdd ? `<path d="${d}" clip-rule="evenodd"/>` : `<path d="${d}"/>`,
  );
  w.defs.add(`<clipPath id="${id}">${paths.join("")}</clipPath>`);
  return `clip-path="url(#${id})"`;
}

/**
 * A `mask` attribute of `content`: shown where it's white (or, `alpha`, where it's opaque). Masks
 * in world coordinates cover the document; others keep SVG's default area, round what they mask.
 */
export function maskAttr(content: string, w: SvgContext, world: boolean, alpha = false): string {
  const id = w.defs.id("m");
  const { x, y, w: width, h } = w.rect;
  const area = world
    ? ` maskUnits="userSpaceOnUse" x="${num(x)}" y="${num(y)}" width="${num(width)}" height="${num(h)}"`
    : "";
  const type = alpha ? ' style="mask-type:alpha"' : "";
  w.defs.add(`<mask id="${id}"${area}${type}>${content}</mask>`);
  return `mask="url(#${id})"`;
}

/** A mask's scope, or `null` for what SVG can't express (the caller flattens it). */
export function writeMaskScope(scope: MaskScopeView, w: SvgContext): string | null {
  const body = w.writeChildren(scope);
  if (!body) return "";
  const attr = scopeMask(scope, w);
  return attr && `<g ${attr}>${body}</g>`;
}

function scopeMask(scope: MaskScopeView, w: SvgContext): string | null {
  const { mode, inverted, shape } = scope.look;
  if (shape) return inverted ? invertedShape(shape, w) : clipAttr(shape, w);
  // SVG masks can't be turned inside out.
  if (inverted) return null;
  return maskAttr(w.writeChildren(scope.source), w, true, mode !== "luminance");
}

function invertedShape(shape: Graphics, w: SvgContext): string | null {
  const outlines = graphicsOutlines(shape);
  if (!outlines) return null;
  const { x, y, w: width, h } = w.rect;
  const all = `<rect x="${num(x)}" y="${num(y)}" width="${num(width)}" height="${num(h)}" fill="#fff"/>`;
  const holes = outlines.map(({ d, evenOdd }) =>
    evenOdd ? `<path d="${d}" fill-rule="evenodd" fill="#000"/>` : `<path d="${d}" fill="#000"/>`,
  );
  return maskAttr(`${all}${holes.join("")}`, w, true);
}
