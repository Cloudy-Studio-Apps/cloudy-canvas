import { Container, Graphics, Text } from "pixi.js";

import type { Point } from "../../geometry.types";
import type { CanvasLinks, LinkView } from "../../links";
import { canvasTextStyle } from "../text-style";
import type { CanvasTextOptions } from "../text-style.types";
import { textResolution } from "../text-resolution";

/**
 * The product's links, in world space under the elements so elements cover their ends. Labels are
 * pooled text nodes, reused from frame to frame.
 */
export class LinkLayer extends Container {
  private readonly lines = new Graphics();
  private readonly labels: Text[] = [];
  private used = 0;
  private resolution = 1;

  constructor(private readonly links: readonly CanvasLinks[]) {
    super();
    this.addChild(this.lines);
  }

  draw(view: Omit<LinkView, "label">): void {
    this.lines.clear();
    this.used = 0;
    const full: LinkView = {
      ...view,
      label: (text, at, options) => this.placeLabel(text, at, options),
    };
    for (const links of this.links) links.draw(this.lines, full);
    for (let i = this.used; i < this.labels.length; i++) this.labels[i]!.visible = false;
  }

  /** Re-rasterizes the labels for the zoom level. */
  setTextZoom(zoom: number): void {
    this.resolution = textResolution(zoom);
    for (const label of this.labels) label.resolution = this.resolution;
  }

  private placeLabel(text: string, at: Point, options: CanvasTextOptions): void {
    let node = this.labels[this.used];
    if (!node) {
      node = new Text({ text, resolution: this.resolution });
      this.labels.push(node);
      this.addChild(node);
    }
    this.used++;
    node.text = text;
    Object.assign(node.style, canvasTextStyle(options));
    node.visible = true;
    node.position.set(at.x - node.width / 2, at.y - node.height / 2);
  }
}
