import { Container, Graphics, Text } from "pixi.js";

import type { Camera } from "../../camera";
import { ELEMENT_DEFAULTS } from "../../elements/element.defaults";
import type { SizeLabel } from "../overlay-state.types";

/** Gap between the selection and the label, in screen px. */
const GAP_PX = 8;
const PADDING_X = 5;
const PADDING_Y = 2;
const FONT_SIZE = 11;
const TEXT_COLOR = 0xffffff;

/** The selection's size ("120 × 80") in a small tag centered under it, in screen space. */
export class SizeLabelLayer extends Container {
  private readonly tag = new Graphics();
  private readonly text = new Text({
    text: "",
    resolution: window.devicePixelRatio || 1,
    style: { fontFamily: ELEMENT_DEFAULTS.fontFamily, fontSize: FONT_SIZE, fill: TEXT_COLOR },
  });

  constructor() {
    super();
    this.addChild(this.tag, this.text);
    this.visible = false;
  }

  draw(camera: Camera, size: SizeLabel | null, color: number): void {
    this.visible = size !== null;
    if (!size) return;
    this.text.text = `${formatSize(size.w)} × ${formatSize(size.h)}`;
    const r = camera.worldRectToScreen(size.under);
    const w = this.text.width + PADDING_X * 2;
    const h = this.text.height + PADDING_Y * 2;
    const x = Math.round(r.x + r.w / 2 - w / 2);
    const y = Math.round(r.y + r.h + GAP_PX);
    this.tag.clear().roundRect(x, y, w, h, 2).fill({ color });
    this.text.position.set(x + PADDING_X, y + PADDING_Y);
  }
}

/** Whole units, or up to two decimals. */
function formatSize(value: number): string {
  return String(Math.round(value * 100) / 100);
}
