import { Container, Graphics, Text } from "pixi.js";

import type { CanvasElement, ElementKind, ElementTextStyle } from "../elements";
import { canvasTextStyle } from "./text-style";
import type { CanvasTextOptions } from "./text-style.types";

/** Pixi display object for one element. Redrawn in place by its kind whenever the element changes. */
export class ElementView extends Container {
  readonly elementId: string;
  /** Drawing order key (the element's fractional index). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  /** Extra keyed labels, for elements that show several (e.g. a table's column names). */
  private readonly textSlots = new Map<string, Text>();
  private textVisible = true;
  private textResolution = 1;

  constructor(el: CanvasElement, kind: ElementKind) {
    super();
    this.elementId = el.id;
    this.order = el.index;
    this.addChild(this.graphics);
    this.sync(el, kind);
  }

  /** Moves the view to the element and has its kind redraw it. */
  sync(el: CanvasElement, kind: ElementKind): void {
    this.order = el.index;
    this.position.set(el.x, el.y);
    kind.draw(this, el);
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

  /** Creates or updates the label stored under `key` (positioned by the caller). */
  setTextSlot(key: string, value: string, options: CanvasTextOptions): Text {
    const style = canvasTextStyle(options);
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

  /** Destroys the labels whose keys aren't in `keep`. */
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
    for (const node of [this.textNode, ...this.textSlots.values()]) {
      if (node && node.resolution !== resolution) node.resolution = resolution;
    }
  }
}
