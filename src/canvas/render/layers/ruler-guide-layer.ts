import { Container, Graphics, Text } from "pixi.js";

import type { Camera } from "../../camera";
import { ELEMENT_DEFAULTS } from "../../elements/element.defaults";
import type { Point } from "../../geometry.types";
import { frameGuideEnds, guideInside, type PlacedGuide } from "../../ruler-guides";
import type { RulerGuidesView } from "./ruler-guide-layer.types";

/** Gap between the canvas edge (or the ruler) and the value's tag, and the tag and its guide. */
const GAP_PX = 4;
const PADDING_X = 4;
const PADDING_Y = 1;
const FONT_SIZE = 10;
const TEXT_COLOR = 0xffffff;

/**
 * Ruler guides as 1px lines in screen space: page guides across the whole view, a frame's guides
 * across that frame only. The one being dragged shows its value (a frame's from its corner) in a
 * tag by its ruler.
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
    if (!view) return;
    const { w, h } = camera.viewport;
    for (const guide of view.guides) {
      // The dragged one shows wherever it is.
      if (guide.index !== view.active && !guideInside(guide)) continue;
      if (guide.rotation) {
        this.drawTurned(camera, guide);
        continue;
      }
      const area = guide.within ? camera.worldRectToScreen(guide.within) : { x: 0, y: 0, w, h };
      const at = Math.round(screenAt(camera, guide));
      // Filled 1px rects: one stroked path of many lines doesn't keep its color everywhere.
      if (guide.axis === "x") this.lines.rect(at, Math.round(area.y), 1, Math.round(area.h));
      else this.lines.rect(Math.round(area.x), at, Math.round(area.w), 1);
    }
    this.lines.fill({ color });

    const active = view.guides.find((guide) => guide.index === view.active);
    if (active) this.drawTag(camera, active, view.inset, color);
  }

  /** A turned frame's guide: a 1px wide quad along it. */
  private drawTurned(camera: Camera, guide: PlacedGuide): void {
    const ends = frameGuideEnds(guide);
    if (!ends) return;
    const [a, b] = ends.map((p) => camera.worldToScreen(p)) as [Point, Point];
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = ((a.y - b.y) / length) * 0.5;
    const ny = ((b.x - a.x) / length) * 0.5;
    this.lines.poly([
      a.x + nx,
      a.y + ny,
      b.x + nx,
      b.y + ny,
      b.x - nx,
      b.y - ny,
      a.x - nx,
      a.y - ny,
    ]);
  }

  /** The dragged guide's value by its ruler (a turned frame's by the guide's start). */
  private drawTag(camera: Camera, guide: PlacedGuide, inset: number, color: number): void {
    const origin = guide.within ? guide.within[guide.axis] : 0;
    this.text.text = String(Math.round((guide.value - origin) * 100) / 100);
    this.text.visible = true;
    const tagW = this.text.width + PADDING_X * 2;
    const tagH = this.text.height + PADDING_Y * 2;
    const ends = guide.rotation ? frameGuideEnds(guide) : null;
    const start = ends && camera.worldToScreen(ends[0]);
    const at = Math.round(screenAt(camera, guide));
    const x = start ? start.x + GAP_PX : guide.axis === "x" ? at + GAP_PX : inset + GAP_PX;
    const y = start ? start.y + GAP_PX : guide.axis === "x" ? inset + GAP_PX : at - GAP_PX - tagH;
    this.tag.roundRect(x, y, tagW, tagH, 2).fill({ color });
    this.text.position.set(x + PADDING_X, y + PADDING_Y);
  }
}

/** Where a guide's line sits on screen, along its axis. */
function screenAt(camera: Camera, { axis, value }: PlacedGuide): number {
  return (value + camera[axis]) * camera.zoom;
}
