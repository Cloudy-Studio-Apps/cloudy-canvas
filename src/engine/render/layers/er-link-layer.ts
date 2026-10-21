import { Container, Graphics, Text } from "pixi.js";

import { ER_STROKE_WIDTH, INK_COLOR, MUTED_INK_COLOR } from "../../document";
import type { ErLink } from "../../er";
import { shapeTextStyle } from "../shapes/text-style";
import { textResolution } from "../text-resolution";

const LABEL_FONT_SIZE = 11;

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
      this.lines
        .moveTo(link.from.x, link.from.y)
        .lineTo(link.to.x, link.to.y)
        .stroke({ color: active ? highlight : INK_COLOR, width: ER_STROKE_WIDTH });
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
