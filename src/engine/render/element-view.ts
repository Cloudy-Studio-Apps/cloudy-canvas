import { Container, Graphics, Text } from "pixi.js";

import { kindOf, type CanvasElement, type ElementTextStyle } from "../elements";
import { canvasTextStyle } from "./text-style";
import type { CanvasTextOptions } from "./text-style.types";

/** Pixi display object for one element. Redrawn in place by its kind whenever the element changes. */
export class ElementView extends Container {
  readonly elementId: string;
  /** Drawing order key (the element's fractional index). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  private textVisible = true;
  private textResolution = 1;

  constructor(el: CanvasElement) {
    super();
    this.elementId = el.id;
    this.order = el.index;
    this.addChild(this.graphics);
    this.sync(el);
  }

  sync(el: CanvasElement): void {
    this.order = el.index;
    this.position.set(el.x, el.y);
    kindOf(el).draw(this, el);
  }

  /** Creates or updates the view's text. */
  setText(value: string, options: CanvasTextOptions): Text {
    const style = canvasTextStyle(options);
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

  /** Lays the text out in a `w`×`h` box as the style says, the same way the text editor does. */
  placeText(value: string, style: ElementTextStyle, w: number, h: number): Text {
    const text = this.setText(value, {
      fontSize: style.fontSize,
      color: style.color,
      fontWeight: style.fontWeight,
      align: style.align,
      wrapWidth: Math.max(1, w - style.padX * 2),
    });
    const x = style.align === "center" ? (w - text.width) / 2 : style.padX;
    const y = style.vAlign === "middle" ? (h - text.height) / 2 : style.padY;
    text.position.set(x, y);
    return text;
  }

  setTextVisible(visible: boolean): void {
    this.textVisible = visible;
    if (this.textNode) this.textNode.visible = visible;
  }

  setTextResolution(resolution: number): void {
    this.textResolution = resolution;
    if (this.textNode && this.textNode.resolution !== resolution) {
      this.textNode.resolution = resolution;
    }
  }
}
