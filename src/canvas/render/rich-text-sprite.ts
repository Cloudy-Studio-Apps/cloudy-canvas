import { CanvasSource, Sprite, Texture } from "pixi.js";

import type { Rect } from "../geometry.types";
import { drawRichText } from "../text/rich/draw-rich-text";
import { richTextInk } from "../text/rich/rich-text-ink";
import type { RichTextLayout } from "../text/rich/rich-text.types";
import { cappedTextResolution } from "./text-resolution";

/**
 * A laid-out text (`RichTextLayout`) drawn into one canvas texture, placed in its element's
 * frame: every span in its own font and color, on the layout's baselines. Drawn again when the
 * layout, the resolution or the fonts change.
 */
export class RichTextSprite extends Sprite {
  private layout: RichTextLayout | null = null;
  private resolution = 1;

  /** Shows `layout` at `resolution` (capped by its size, as other texts are). */
  show(layout: RichTextLayout, resolution: number): void {
    this.layout = layout;
    this.resolution = resolution;
    this.redraw();
  }

  setResolution(resolution: number): void {
    if (resolution === this.resolution) return;
    this.resolution = resolution;
    this.redraw();
  }

  /** Draws it again (a font it uses has loaded). */
  redraw(): void {
    if (!this.layout) return;
    const { texture, ink } = renderLayout(this.layout, this.resolution, false);
    const previous = this.texture;
    this.texture = texture;
    this.position.set(ink.x, ink.y);
    if (previous !== Texture.EMPTY) previous.destroy(true);
  }

  /** The text drawn opaque white (glyphs to show paints through) and where it's placed. */
  maskTexture(): { texture: Texture; x: number; y: number } | null {
    if (!this.layout) return null;
    const { texture, ink } = renderLayout(this.layout, this.resolution, true);
    return { texture, x: ink.x, y: ink.y };
  }

  override destroy(options?: Parameters<Sprite["destroy"]>[0]): void {
    if (this.texture !== Texture.EMPTY) this.texture.destroy(true);
    super.destroy(options);
  }
}

function renderLayout(
  layout: RichTextLayout,
  resolution: number,
  white: boolean,
): { texture: Texture; ink: Rect } {
  const ink = richTextInk(layout);
  const res = cappedTextResolution(resolution, Math.max(ink.w, ink.h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(ink.w * res));
  canvas.height = Math.max(1, Math.ceil(ink.h * res));
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(res, 0, 0, res, -ink.x * res, -ink.y * res);
    drawRichText(ctx, layout, white);
  }
  const source = new CanvasSource({ resource: canvas, resolution: res });
  return { texture: new Texture({ source }), ink };
}
