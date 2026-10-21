import { Container, Graphics, Text } from "pixi.js";

import {
  FONT_FAMILY,
  LINE_HEIGHT,
  STICKY_FONT_SIZE,
  STICKY_PADDING,
  INK_COLOR,
  type Shape,
  type StickyShape,
  type StrokeShape,
  type TextShape,
} from "../document";
import { strokeOutline } from "./stroke-outline";

/** Pixi display object for one shape. Rebuilt in place when the shape changes. */
export class ShapeView extends Container {
  readonly shapeId: string;
  index: string;
  private background = new Graphics();
  private text: Text | null = null;

  constructor(shape: Shape) {
    super();
    this.shapeId = shape.id;
    this.index = shape.index;
    this.addChild(this.background);
    this.sync(shape);
  }

  sync(shape: Shape): void {
    this.index = shape.index;
    this.position.set(shape.x, shape.y);
    switch (shape.type) {
      case "sticky":
        this.drawSticky(shape);
        break;
      case "text":
        this.drawText(shape);
        break;
      case "stroke":
        this.drawStroke(shape);
        break;
    }
  }

  setTextVisible(visible: boolean): void {
    if (this.text) this.text.visible = visible;
  }

  setTextResolution(resolution: number): void {
    if (this.text && this.text.resolution !== resolution) this.text.resolution = resolution;
  }

  private drawSticky(shape: StickyShape): void {
    this.background
      .clear()
      // Soft paper shadow
      .rect(1, 3, shape.w - 2, shape.h)
      .fill({ color: 0x1b2330, alpha: 0.07 })
      .rect(0, 0, shape.w, shape.h)
      .fill({ color: shape.color })
      .stroke({ color: 0x1b2330, alpha: 0.06, width: 1, alignment: 1 });
    const text = this.ensureText(shape.text, {
      fontSize: STICKY_FONT_SIZE,
      wordWrap: true,
      wordWrapWidth: shape.w - STICKY_PADDING * 2,
      color: INK_COLOR,
    });
    // TODO: Shrink the font when text overflows the note.
    text.position.set(STICKY_PADDING, STICKY_PADDING);
  }

  private drawText(shape: TextShape): void {
    this.background.clear();
    this.ensureText(shape.text, { fontSize: shape.fontSize, wordWrap: false, color: shape.color });
  }

  private drawStroke(shape: StrokeShape): void {
    const outline = strokeOutline(shape.points, shape.size, true);
    this.background.clear();
    if (outline.length >= 6) this.background.poly(outline).fill({ color: shape.color });
  }

  private ensureText(
    value: string,
    opts: { fontSize: number; wordWrap: boolean; wordWrapWidth?: number; color: string },
  ): Text {
    const style = {
      fontFamily: FONT_FAMILY,
      fontSize: opts.fontSize,
      lineHeight: opts.fontSize * LINE_HEIGHT,
      fill: opts.color,
      wordWrap: opts.wordWrap,
      wordWrapWidth: opts.wordWrapWidth ?? 0,
      breakWords: true,
      whiteSpace: "pre" as const,
    };
    if (!this.text) {
      this.text = new Text({ text: value, style });
      this.addChild(this.text);
    } else {
      this.text.text = value;
      Object.assign(this.text.style, style);
    }
    return this.text;
  }
}
