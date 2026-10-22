import { CanvasSource, Matrix, Texture, type FillStyle } from "pixi.js";

import { applyAffine, gradientKey, gradientParam, gradientRamp, RAMP_SIZE } from "../gradient";
import type { Gradient } from "../gradient";
import type { Rect } from "../geometry.types";

/** Pixels a side of a gradient texture. */
const SIZE = 512;
/**
 * The normalized area a texture covers, past the box on every side, so strokes and gradients
 * reaching outside the box are drawn right; further out it mirrors.
 */
const FROM = -0.5;
const SPAN = 2;

/** A 4×4 ordered dither, which keeps smooth gradients from banding. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16 - 0.5,
);

interface Entry {
  texture: Texture;
  users: number;
}

/** Drawn gradients, shared by every view that paints the same one, freed with their last user. */
const entries = new Map<string, Entry>();

/** Draws the gradient over its box's normalized area (see `FROM`, `SPAN`). */
function drawGradient(gradient: Gradient): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(SIZE, SIZE);
  const ramp = gradientRamp(gradient);
  const toGradient = gradient.transform;
  const data = image.data;
  for (let py = 0; py < SIZE; py++) {
    const ny = FROM + ((py + 0.5) / SIZE) * SPAN;
    for (let px = 0; px < SIZE; px++) {
      const nx = FROM + ((px + 0.5) / SIZE) * SPAN;
      const g = applyAffine(toGradient, { x: nx, y: ny });
      const t = Math.min(1, Math.max(0, gradientParam(gradient.type, g.x, g.y)));
      const r = Math.round(t * (RAMP_SIZE - 1)) * 4;
      const dither = BAYER[(py & 3) * 4 + (px & 3)]!;
      const o = (py * SIZE + px) * 4;
      data[o] = ramp[r]! * 255 + dither;
      data[o + 1] = ramp[r + 1]! * 255 + dither;
      data[o + 2] = ramp[r + 2]! * 255 + dither;
      data[o + 3] = ramp[r + 3]! * 255 + dither;
    }
  }
  context.putImageData(image, 0, 0);
  const source = new CanvasSource({
    resource: canvas,
    addressMode: "mirror-repeat",
    scaleMode: "linear",
  });
  return new Texture({ source });
}

/**
 * The gradient's texture, drawn once while anything uses it: every `acquireGradient` is matched by
 * a `releaseGradient` of the key it returns.
 */
export function acquireGradient(gradient: Gradient): { key: string; texture: Texture } {
  const key = gradientKey(gradient);
  let entry = entries.get(key);
  if (!entry) {
    entry = { texture: drawGradient(gradient), users: 0 };
    entries.set(key, entry);
  }
  entry.users++;
  return { key, texture: entry.texture };
}

/** Lets go of a texture `acquireGradient` gave; the last user frees it. */
export function releaseGradient(key: string): void {
  const entry = entries.get(key);
  if (!entry || --entry.users > 0) return;
  entries.delete(key);
  entry.texture.destroy(true);
}

/** Fills or strokes with `texture` laid on the box `box` (local coordinates, see `FROM`). */
export function gradientFillStyle(texture: Texture, box: Rect, alpha: number): FillStyle {
  const w = Math.max(box.w, 1e-3);
  const h = Math.max(box.h, 1e-3);
  return {
    texture,
    alpha,
    textureSpace: "global",
    matrix: new Matrix(
      (SPAN * w) / SIZE,
      0,
      0,
      (SPAN * h) / SIZE,
      box.x + FROM * w,
      box.y + FROM * h,
    ),
  };
}
