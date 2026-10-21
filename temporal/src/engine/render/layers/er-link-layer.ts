import { Container, Graphics, Text } from "pixi.js";

import { ER_FILL_COLOR, ER_STROKE_WIDTH, INK_COLOR, MUTED_INK_COLOR } from "../../document";
import type { ErLink } from "../../er";
import { drawArrowHead } from "../shapes/arrow-head";
import { shapeTextStyle } from "../shapes/text-style";
import { textResolution } from "../text-resolution";

const LABEL_FONT_SIZE = 11;
/** The circle on a total hierarchy's parent line. */
const TOTAL_MARK_RADIUS = 5;

/** Lines of ER diagrams and their cardinality labels, in world space under the shapes. */
export class ErLinkLayer extends Container {
  private readonly lines = new Graphics();
  private readonly labels: Text[] = [];
  private resolution = 1;

  constructor() {
    super();
    this.addChild(this.lines);
  }

  draw(links: readonly ErLink[], highlighted: ReadonlySet<string>, highlight: number): void {
    this.lines.clear();
    let used = 0;
    for (const link of links) {
      const active = highlighted.has(link.fromId) || highlighted.has(link.toId);
      const color = active ? highlight : INK_COLOR;
      const [first, ...rest] = link.points;
      if (!first) continue;
      this.lines.moveTo(first.x, first.y);
      for (const p of rest) this.lines.lineTo(p.x, p.y);
      this.lines.stroke({ color, width: ER_STROKE_WIDTH });
      const end = link.points[link.points.length - 1]!;
      const before = link.points[link.points.length - 2] ?? first;
      if (link.arrow) {
        drawArrowHead(this.lines, before, end);
        this.lines.fill({ color });
      }
      if (link.totalMark) {
        const mid = { x: (first.x + end.x) / 2, y: (first.y + end.y) / 2 };
        this.lines
          .circle(mid.x, mid.y, TOTAL_MARK_RADIUS)
          .fill({ color: ER_FILL_COLOR })
          .stroke({ color, width: ER_STROKE_WIDTH });
      }
      if (!link.label || !link.labelAt) continue;
      const label = this.takeLabel(used++);
      label.text = link.label;
      label.position.set(link.labelAt.x - label.width / 2, link.labelAt.y - label.height / 2);
    }
    for (let i = used; i < this.labels.length; i++) this.labels[i]!.visible = false;
  }

  setTextZoom(zoom: number): void {
    this.resolution = textResolution(zoom);
    for (const label of this.labels) label.resolution = this.resolution;
  }

  private takeLabel(i: number): Text {
    let label = this.labels[i];
    if (!label) {
      label = new Text({
        text: "",
        style: shapeTextStyle({ fontSize: LABEL_FONT_SIZE, color: MUTED_INK_COLOR }),
        resolution: this.resolution,
      });
      this.labels.push(label);
      this.addChild(label);
    }
    label.visible = true;
    return label;
  }
}
