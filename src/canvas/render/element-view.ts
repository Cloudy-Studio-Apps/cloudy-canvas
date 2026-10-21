import { Container, Graphics, Sprite, Text, type Texture } from "pixi.js";

import {
  zOrderKey,
  type CanvasElement,
  type ElementKind,
  type ElementTextStyle,
} from "../elements";
import type { Rect } from "../geometry.types";
import type { ImageCache } from "./image-cache";
import { canvasTextStyle } from "./text-style";
import type { CanvasTextOptions } from "./text-style.types";

/** Pixi display object for one element. Redrawn in place by its kind whenever the element changes. */
export class ElementView extends Container {
  readonly elementId: string;
  /** Drawing order key (see `zOrderKey`). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  /** Extra keyed labels, for elements that show several (e.g. a table's column names). */
  private readonly textSlots = new Map<string, Text>();
  private textVisible = true;
  private textResolution = 1;
  private image: Sprite | null = null;
  /** The image asset the view shows, and the box it's fitted into (local coordinates). */
  private imageAsset: string | null = null;
  private imageBox: Rect = { x: 0, y: 0, w: 0, h: 0 };

  constructor(
    el: CanvasElement,
    kind: ElementKind,
    private readonly images: ImageCache,
  ) {
    super();
    this.elementId = el.id;
    this.order = zOrderKey(el, kind);
    this.addChild(this.graphics);
    this.sync(el, kind);
  }

  /** Moves the view to the element and has its kind redraw it. */
  sync(el: CanvasElement, kind: ElementKind): void {
    this.order = zOrderKey(el, kind);
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

  /**
   * Shows an image asset fitted into `box` (local coordinates), keeping its proportions and
   * centered. It appears once its texture has loaded.
   */
  placeImage(assetId: string, box: Rect): void {
    if (!this.image) {
      this.image = new Sprite();
      this.addChildAt(this.image, this.getChildIndex(this.graphics) + 1);
    }
    this.imageAsset = assetId;
    this.imageBox = box;
    const texture = this.images.get(assetId);
    if (texture) return this.fitImage(texture);
    this.image.visible = false;
    void this.images.load(assetId).then((loaded) => {
      if (loaded && !this.destroyed && this.imageAsset === assetId) this.fitImage(loaded);
    });
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

  private fitImage(texture: Texture): void {
    const image = this.image!;
    const { x, y, w, h } = this.imageBox;
    const scale = Math.min(w / texture.width, h / texture.height);
    image.texture = texture;
    image.setSize(texture.width * scale, texture.height * scale);
    image.position.set(x + (w - image.width) / 2, y + (h - image.height) / 2);
    image.visible = true;
  }
}
