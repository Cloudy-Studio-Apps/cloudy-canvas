import { Texture, TexturePool, type FilterSystem } from "pixi.js";

import type { Rect } from "../../geometry.types";
import { rotatePoint } from "../../rotation";
import type { EffectPass } from "./effect-renderer.types";
import type { EffectPassFrame } from "./effect-pass.types";
import type { EffectShader } from "./effect-shader";
import { blurShader, MAX_BLUR_TAPS } from "./effect-shaders";

const ORIGIN = { x: 0, y: 0 };

/**
 * The `EffectPass` of one scope's filter while it's applied: runs shaders through Pixi's filter
 * system into pooled textures of the content's size, and returns them all when `release`d.
 */
export class FilterEffectPass implements EffectPass {
  private readonly pooled: Texture[] = [];
  readonly toLocal: readonly [number, number, number, number, number, number];

  constructor(
    private readonly filters: FilterSystem,
    readonly content: Texture,
    readonly backdrop: Texture,
    private readonly frame: EffectPassFrame,
  ) {
    this.toLocal = localMap(content, frame);
  }

  get scale(): number {
    return this.frame.scale;
  }

  get box(): Rect {
    return this.frame.box;
  }

  px(world: number): number {
    return world * this.frame.scale;
  }

  offset(dx: number, dy: number): { x: number; y: number } {
    const turned = rotatePoint({ x: dx, y: dy }, ORIGIN, this.frame.rotation);
    return { x: turned.x * this.frame.scale, y: turned.y * this.frame.scale };
  }

  texture(): Texture {
    const texture = TexturePool.getSameSizeTexture(this.content);
    this.pooled.push(texture);
    return texture;
  }

  run(shader: EffectShader, input: Texture, output: Texture = this.texture()): Texture {
    this.filters.applyFilter(shader.filter, input, output, true);
    return output;
  }

  blur(input: Texture, radius: number): Texture {
    const sigma = radius / 2;
    if (sigma < 0.25) return input;
    // Taps one pixel apart up to the most a pass takes; past that they spread out evenly.
    const reach = Math.ceil(sigma * 3);
    const taps = Math.min(reach, MAX_BLUR_TAPS);
    const spacing = reach / taps;
    blurShader.set({ uTaps: taps, uSigma: sigma / spacing, uStep: [spacing, 0] });
    const across = this.run(blurShader, input);
    blurShader.set({ uStep: [0, spacing] });
    return this.run(blurShader, across);
  }

  /** Returns every texture the pass took to the pool. */
  release(): void {
    for (const texture of this.pooled) TexturePool.returnTexture(texture);
    this.pooled.length = 0;
  }
}

/** What a pass without a backdrop reads as one. */
export const NO_BACKDROP = Texture.EMPTY;

/**
 * Texture coordinates → the element's own coordinates: a texture coordinate is a CSS pixel of
 * the filter's area (from its corner, `origin`), which the scope's world transform maps from
 * world units, which the element's turn maps from its own.
 */
function localMap(
  texture: Texture,
  { origin, transform, box, rotation }: EffectPassFrame,
): [number, number, number, number, number, number] {
  const size = { w: texture.source.width, h: texture.source.height };
  const toLocal = (u: number, v: number) => {
    const world = transform.applyInverse({ x: origin.x + u * size.w, y: origin.y + v * size.h });
    const unturned = rotatePoint(world, box, -rotation);
    return { x: unturned.x - box.x, y: unturned.y - box.y };
  };
  const o = toLocal(0, 0);
  const u = toLocal(1, 0);
  const v = toLocal(0, 1);
  return [u.x - o.x, u.y - o.y, v.x - o.x, v.y - o.y, o.x, o.y];
}
