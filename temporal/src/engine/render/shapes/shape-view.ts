import { Container, Graphics, Text } from "pixi.js";

import { zOrderKey, type Shape } from "../../document";
import { drawShape } from "./shape-drawers";
import { shapeTextStyle } from "./text-style";
import type { ShapeTextOptions } from "./text-style.types";

/** Pixi display object for one shape. Redrawn in place by its type's drawer when the shape changes. */
export class ShapeView extends Container {
  readonly shapeId: string;
  /** Drawing order key (see `zOrderKey`). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  /** Extra keyed text nodes, for shapes that show several labels (e.g. database tables). */
  private readonly textSlots = new Map<string, Text>();
  private textVisible = true;
  private textResolution = 1;

  constructor(shape: Shape) {
    super();
    this.shapeId = shape.id;
    this.order = zOrderKey(shape);
    this.addChild(this.graphics);
    this.sync(shape);
  }

  sync(shape: Shape): void {
    this.order = zOrderKey(shape);
    this.position.set(shape.x, shape.y);
    drawShape(this, shape);
  }

  /** Creates or updates the view's text. */
  setText(value: string, options: ShapeTextOptions): Text {
    const style = shapeTextStyle(options);
    if (!this.textNode) {
      this.textNode = new Text({ text: value, style, resolution: this.textResolution });
      this.textNode.visible = this.textVisible;
      this.addChild(this.textNode);
    } else {
      this.textNode.text = value;
      Object.assign(this.textNode.style, style);
    }
    return this.textNode;
  }

  /** Creates or updates the text node stored under `key`. */
  setTextSlot(key: string, value: string, options: ShapeTextOptions): Text {
    const style = shapeTextStyle(options);
    let node = this.textSlots.get(key);
    if (!node) {
      node = new Text({ text: value, style, resolution: this.textResolution });
      this.textSlots.set(key, node);
      this.addChild(node);
    } else {
      node.text = value;
      Object.assign(node.style, style);
    }
    return node;
  }

  /** Destroys the text slots that aren't in `keep`. */
  pruneTextSlots(keep: ReadonlySet<string>): void {
    for (const [key, node] of this.textSlots) {
      if (keep.has(key)) continue;
      node.destroy();
      this.textSlots.delete(key);
    }
  }

  setTextVisible(visible: boolean): void {
    this.textVisible = visible;
    if (this.textNode) this.textNode.visible = visible;
  }

  setTextResolution(resolution: number): void {
    this.textResolution = resolution;
    if (this.textNode && this.textNode.resolution !== resolution)
      this.textNode.resolution = resolution;
    for (const node of this.textSlots.values()) {
      if (node.resolution !== resolution) node.resolution = resolution;
    }
  }
}
