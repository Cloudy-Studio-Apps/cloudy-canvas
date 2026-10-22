import { Container, Graphics, Text } from "pixi.js";

import type { Camera } from "../../camera";
import { ELEMENT_DEFAULTS } from "../../elements/element.defaults";
import type { Point } from "../../geometry.types";
import type { SnapFeedback, SnapGap, SnapLine } from "../../snapping";

/** Half the size of a line's × marks, in screen px. */
const MARK_PX = 3;
/** Length of a gap's end ticks, in screen px. */
const TICK_PX = 6;
const LABEL_PADDING_X = 4;
const LABEL_PADDING_Y = 1;
const LABEL_FONT_SIZE = 10;
const LABEL_COLOR = 0xffffff;
/** How far below and right of the pointer a pointer tag sits, in screen px. */
const POINTER_OFFSET_PX = 14;

/** Smart guides (lines things lined up on, equal gaps) and measurements, in screen space. */
export class SnapLayer extends Container {
  private readonly lines = new Graphics();
  private readonly tags = new Graphics();
  private readonly labels: Text[] = [];

  constructor() {
    super();
    this.addChild(this.lines, this.tags);
  }

  draw(camera: Camera, feedback: SnapFeedback | null, color: number): void {
    this.lines.clear();
    this.tags.clear();
    let used = 0;
    if (feedback) {
      for (const line of feedback.lines) this.drawLine(camera, line);
      for (const gap of feedback.gaps) {
        this.drawGap(camera, gap);
        this.placeLabel(camera, gap, used++, color);
      }
      for (const { at, text } of feedback.labels ?? []) {
        const p = camera.worldToScreen(at);
        this.placeTag(text, p.x + POINTER_OFFSET_PX, p.y + POINTER_OFFSET_PX, used++, color);
      }
      this.lines.stroke({ color, width: 1 });
    }
    for (let i = 0; i < this.labels.length; i++) this.labels[i]!.visible = i < used;
  }

  private drawLine(camera: Camera, { axis, at, marks }: SnapLine): void {
    if (marks.length === 0) return;
    const point = (along: number): Point =>
      camera.worldToScreen(axis === "x" ? { x: at, y: along } : { x: along, y: at });
    const a = crisp(point(Math.min(...marks)));
    const b = crisp(point(Math.max(...marks)));
    this.lines.moveTo(a.x, a.y).lineTo(b.x, b.y);
    for (const mark of marks) {
      const { x, y } = crisp(point(mark));
      this.lines
        .moveTo(x - MARK_PX, y - MARK_PX)
        .lineTo(x + MARK_PX, y + MARK_PX)
        .moveTo(x - MARK_PX, y + MARK_PX)
        .lineTo(x + MARK_PX, y - MARK_PX);
    }
  }

  private drawGap(camera: Camera, gap: SnapGap): void {
    const [a, b] = gapEnds(camera, gap);
    this.lines.moveTo(a.x, a.y).lineTo(b.x, b.y);
    const half = TICK_PX / 2;
    for (const end of [a, b]) {
      if (gap.axis === "x") this.lines.moveTo(end.x, end.y - half).lineTo(end.x, end.y + half);
      else this.lines.moveTo(end.x - half, end.y).lineTo(end.x + half, end.y);
    }
  }

  /** The gap's length in a tag past its middle. */
  private placeLabel(camera: Camera, gap: SnapGap, i: number, color: number): void {
    const label = this.labelAt(i);
    label.text = String(Math.round((gap.to - gap.from) * 100) / 100);
    const [a, b] = gapEnds(camera, gap);
    const w = label.width + LABEL_PADDING_X * 2;
    const h = label.height + LABEL_PADDING_Y * 2;
    const x = gap.axis === "x" ? (a.x + b.x) / 2 - w / 2 : a.x + TICK_PX;
    const y = gap.axis === "x" ? a.y + TICK_PX : (a.y + b.y) / 2 - h / 2;
    this.placeTag(label.text, x, y, i, color);
  }

  /** A tag with `text` whose top-left corner is at (x, y), screen px. */
  private placeTag(text: string, x: number, y: number, i: number, color: number): void {
    const label = this.labelAt(i);
    label.text = text;
    const w = label.width + LABEL_PADDING_X * 2;
    const h = label.height + LABEL_PADDING_Y * 2;
    const left = Math.round(x);
    const top = Math.round(y);
    this.tags.roundRect(left, top, w, h, 2).fill({ color });
    label.position.set(left + LABEL_PADDING_X, top + LABEL_PADDING_Y);
  }

  private labelAt(i: number): Text {
    let label = this.labels[i];
    if (!label) {
      label = new Text({
        text: "",
        resolution: window.devicePixelRatio || 1,
        style: {
          fontFamily: ELEMENT_DEFAULTS.fontFamily,
          fontSize: LABEL_FONT_SIZE,
          fill: LABEL_COLOR,
        },
      });
      this.labels.push(label);
      this.addChild(label);
    }
    return label;
  }
}

function gapEnds(camera: Camera, { axis, from, to, cross }: SnapGap): [Point, Point] {
  const at = (v: number) => (axis === "x" ? { x: v, y: cross } : { x: cross, y: v });
  return [crisp(camera.worldToScreen(at(from))), crisp(camera.worldToScreen(at(to)))];
}

/** On the middle of a pixel, so 1px lines stay sharp. */
function crisp({ x, y }: Point): Point {
  return { x: Math.round(x) + 0.5, y: Math.round(y) + 0.5 };
}
