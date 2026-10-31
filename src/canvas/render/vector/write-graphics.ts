import {
  Texture,
  type ConvertedFillStyle,
  type Graphics,
  type GraphicsInstructions,
  type Matrix,
} from "pixi.js";

import { gradientOfFill } from "../gradient-texture";
import { holePieces, pathData } from "./path-data";
import { hexOf, num } from "./svg-format";
import type { SvgContext, SvgOutline } from "./svg-context.types";
import { gradientPaint } from "./write-gradient";

/** Where Pixi's strokes sit on their path: centered, the only kind SVG strokes come in. */
const CENTERED = 0.5;

/** A `Graphics` as `<path>`s, or `null` for what can't be written (the caller flattens it). */
export function writeGraphics(g: Graphics, w: SvgContext): string | null {
  const parts: string[] = [];
  const { instructions } = g.context;
  for (const [i, instruction] of instructions.entries()) {
    if (instruction.action === "texture") return null;
    const { style, path } = instruction.data;
    const shape = pathData(path);
    const cut = ownHoles(instructions, i, null);
    if (shape === null || cut === null) return null;
    if (!shape) continue;
    const paint = paintAttrs(style, instruction.action === "stroke" ? "stroke" : "fill", w);
    if (paint === null) return null;
    if (instruction.action === "stroke") {
      const stroke = instruction.data.style;
      if (stroke.alignment !== CENTERED) return null;
      parts.push(
        `<path d="${shape}" fill="none" ${paint} stroke-width="${num(stroke.width)}"` +
          ` stroke-linecap="${stroke.cap}" stroke-linejoin="${stroke.join}"` +
          ` stroke-miterlimit="${num(stroke.miterLimit)}"/>`,
      );
    } else {
      const rule = cut ? ' fill-rule="evenodd"' : "";
      parts.push(`<path d="${shape}${cut}"${rule} ${paint}/>`);
    }
  }
  return parts.join("");
}

/**
 * What a `Graphics` fills, in `transform`'s space when given: what clips and vector masks read
 * (their paint doesn't count). `null` when it can't be written.
 */
export function graphicsOutlines(
  g: Graphics,
  transform: Matrix | null = null,
): SvgOutline[] | null {
  const outlines: SvgOutline[] = [];
  const { instructions } = g.context;
  for (const [i, instruction] of instructions.entries()) {
    if (instruction.action === "texture") return null;
    if (instruction.action === "stroke") continue;
    const shape = pathData(instruction.data.path, transform);
    const cut = ownHoles(instructions, i, transform);
    if (shape === null || cut === null) return null;
    if (shape) outlines.push({ d: `${shape}${cut}`, evenOdd: !!cut });
  }
  return outlines;
}

/**
 * The holes of instruction `i`. Pixi's `cut` adds a shape's second and later holes to the shape
 * before it too, where they do nothing on the canvas; in an even-odd SVG path they'd be filled, so
 * those copies are left out. `null` when a hole can't be written.
 */
function ownHoles(
  instructions: readonly GraphicsInstructions[],
  i: number,
  transform: Matrix | null,
): string | null {
  const instruction = instructions[i];
  const hole = instruction?.action === "texture" ? undefined : instruction?.data.hole;
  if (!hole) return "";
  const pieces = holePieces(hole, transform);
  const next = instructions[i + 1];
  const nextHole = next?.action === "texture" ? undefined : next?.data.hole;
  const later = nextHole ? holePieces(nextHole, transform) : [];
  if (!pieces || !later) return null;
  return pieces.filter((piece) => !later.includes(piece)).join("");
}

function paintAttrs(
  style: ConvertedFillStyle,
  attribute: "fill" | "stroke",
  w: SvgContext,
): string | null {
  const faded = style.alpha < 1 ? ` ${attribute}-opacity="${num(style.alpha)}"` : "";
  if (!style.texture || style.texture === Texture.WHITE) {
    return `${attribute}="${hexOf(style.color)}"${faded}`;
  }
  const painted = gradientOfFill(style);
  const paint = painted && gradientPaint(painted.gradient, painted.box, w);
  return paint ? `${attribute}="${paint}"${faded}` : null;
}
