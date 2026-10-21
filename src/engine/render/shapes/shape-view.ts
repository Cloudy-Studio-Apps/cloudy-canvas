import { Container, Graphics, Text } from "pixi.js";

import type { Shape } from "../../document";
import { drawShape } from "./shape-drawers";
import { shapeTextStyle, type ShapeTextOptions } from "./text-style";

/** Pixi display object for one shape. Redrawn in place by its type's drawer when the shape changes. */
export class ShapeView extends Container {
  readonly shapeId: string;
  index: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  private textVisible = true;
  private textResolution = 1;

  constructor(shape: Shape) {
    super();
    this.shapeId = shape.id;
    this.index = shape.index;
    this.addChild(this.graphics);
    this.sync(shape);
  }

  sync(shape: Shape): void {
    this.index = shape.index;
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

  setTextVisible(visible: boolean): void {
    this.textVisible = visible;
    if (this.textNode) this.textNode.visible = visible;
  }

  setTextResolution(resolution: number): void {
    this.textResolution = resolution;
    if (this.textNode && this.textNode.resolution !== resolution)
      this.textNode.resolution = resolution;
  }
}
