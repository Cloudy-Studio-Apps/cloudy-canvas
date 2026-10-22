import { Container, Graphics, Text } from "pixi.js";

import type { Camera } from "../../camera";
import { ELEMENT_DEFAULTS } from "../../elements/element.defaults";
import type { RulerGuidesView } from "./ruler-guide-layer.types";

/** Gap between the canvas edge (or the ruler) and the value's tag, and the tag and its guide. */
const GAP_PX = 4;
const PADDING_X = 4;
const PADDING_Y = 1;
const FONT_SIZE = 10;
const TEXT_COLOR = 0xffffff;

/**
 * Ruler guides as 1px lines across the whole view, in screen space; the one being dragged shows
 * its value in a tag by its ruler.
 */
export class RulerGuideLayer extends Container {
  private readonly lines = new Graphics();
  private readonly tag = new Graphics();
  private readonly text = new Text({
    text: "",
    resolution: window.devicePixelRatio || 1,
    style: { fontFamily: ELEMENT_DEFAULTS.fontFamily, fontSize: FONT_SIZE, fill: TEXT_COLOR },
  });

  constructor() {
    super();
    this.addChild(this.lines, this.tag, this.text);
  }

  draw(camera: Camera, view: RulerGuidesView | null, color: number): void {
    this.lines.clear();
    this.tag.clear();
    this.text.visible = false;
    if (!view || view.guides.length === 0) return;
    const { w, h } = camera.viewport;
    for (const { axis, value } of view.guides) {
      const at = crisp(screenAt(camera, axis, value));
      if (axis === "x") this.lines.moveTo(at, 0).lineTo(at, h);
      else this.lines.moveTo(0, at).lineTo(w, at);
    }
    this.lines.stroke({ color, width: 1 });

    const active = view.active === null ? undefined : view.guides[view.active];
    if (!active) return;
    this.text.text = String(active.value);
    this.text.visible = true;
    const tagW = this.text.width + PADDING_X * 2;
    const tagH = this.text.height + PADDING_Y * 2;
    const at = Math.round(screenAt(camera, active.axis, active.value));
    const x = active.axis === "x" ? at + GAP_PX : view.inset + GAP_PX;
    const y = active.axis === "x" ? view.inset + GAP_PX : at - GAP_PX - tagH;
    this.tag.roundRect(x, y, tagW, tagH, 2).fill({ color });
    this.text.position.set(x + PADDING_X, y + PADDING_Y);
  }
}

/** Where a guide's line sits on screen, along its axis. */
function screenAt(camera: Camera, axis: "x" | "y", value: number): number {
  return (value + camera[axis]) * camera.zoom;
}

/** On the middle of a pixel, so the line stays sharp. */
function crisp(v: number): number {
  return Math.round(v) + 0.5;
}
