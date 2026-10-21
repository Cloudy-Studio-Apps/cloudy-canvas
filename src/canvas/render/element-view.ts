import { Container, Graphics, GraphicsContext, Rectangle, Sprite, Text, Texture } from "pixi.js";

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
import type { ImageFit } from "./element-view.types";

/** Parsed icons, shared by every view that shows them (keyed by their SVG markup). */
const iconContexts = new Map<string, GraphicsContext>();

/** Pixi display object for one element. Redrawn in place by its kind whenever the element changes. */
export class ElementView extends Container {
  readonly elementId: string;
  /** Drawing order key (see `zOrderKey`). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  /** Extra keyed labels, for elements that show several (e.g. a table's column names). */
  private readonly textSlots = new Map<string, Text>();
  /** Extra keyed graphics drawn above the image (e.g. a play button over a thumbnail). */
  private readonly layers = new Map<string, Graphics>();
  private textVisible = true;
  private textResolution = 1;
  private image: Sprite | null = null;
  /** The image asset the view shows, and the box it's fitted into (local coordinates). */
  private imageAsset: string | null = null;
  private imageBox: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private imageFit: ImageFit = "contain";
  /** The cropped view of a texture for `cover` (its source belongs to the image cache). */
  private croppedTexture: Texture | null = null;

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
   * Shows an image asset in `box` (local coordinates), keeping its proportions: `contain` fits it
   * inside, centered; `cover` fills the box and crops what's outside. It appears once its texture
   * has loaded.
   */
  placeImage(assetId: string, box: Rect, fit: ImageFit = "contain"): void {
    if (!this.image) {
      this.image = new Sprite();
      this.addChildAt(this.image, this.getChildIndex(this.graphics) + 1);
    }
    this.imageAsset = assetId;
    this.imageBox = box;
    this.imageFit = fit;
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

  /** The graphics stored under `key`, drawn above the image and the base graphics. */
  layer(key: string): Graphics {
    let layer = this.layers.get(key);
    if (!layer) {
      layer = new Graphics();
      this.layers.set(key, layer);
      this.addChild(layer);
    }
    return layer;
  }

  /**
   * Shows an SVG icon (markup with a square `viewBox` of `viewBoxSize`) scaled into `box`, above
   * the image. Each distinct icon is parsed once.
   */
  placeIcon(key: string, svg: string, box: Rect, viewBoxSize = 24): void {
    let context = iconContexts.get(svg);
    if (!context) {
      context = new GraphicsContext().svg(svg);
      iconContexts.set(svg, context);
    }
    const layer = this.layer(`icon:${key}`);
    if (layer.context !== context) layer.context = context;
    const scale = Math.min(box.w, box.h) / viewBoxSize;
    layer.scale.set(scale);
    layer.position.set(
      box.x + (box.w - viewBoxSize * scale) / 2,
      box.y + (box.h - viewBoxSize * scale) / 2,
    );
    layer.visible = true;
  }

  /** Hides the icon shown under `key`. */
  clearIcon(key: string): void {
    const layer = this.layers.get(`icon:${key}`);
    if (layer) layer.visible = false;
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

  /** Hides the image shown with `placeImage`, if any. */
  clearImage(): void {
    this.imageAsset = null;
    if (this.image) this.image.visible = false;
  }

  override destroy(options?: Parameters<Container["destroy"]>[0]): void {
    this.croppedTexture?.destroy(false);
    this.croppedTexture = null;
    super.destroy(options);
  }

  private fitImage(texture: Texture): void {
    if (this.imageFit === "cover") return this.coverImage(texture);
    const image = this.image!;
    const { x, y, w, h } = this.imageBox;
    const scale = Math.min(w / texture.width, h / texture.height);
    image.texture = texture;
    image.setSize(texture.width * scale, texture.height * scale);
    image.position.set(x + (w - image.width) / 2, y + (h - image.height) / 2);
    image.visible = true;
  }

  /** Fills the box with the middle of the texture, cropped to the box's proportions. */
  private coverImage(texture: Texture): void {
    const image = this.image!;
    const { x, y, w, h } = this.imageBox;
    const scale = Math.max(w / texture.width, h / texture.height);
    const cropW = Math.min(texture.width, w / scale);
    const cropH = Math.min(texture.height, h / scale);
    const frame = new Rectangle(
      texture.frame.x + (texture.width - cropW) / 2,
      texture.frame.y + (texture.height - cropH) / 2,
      cropW,
      cropH,
    );
    this.croppedTexture?.destroy(false);
    this.croppedTexture = new Texture({ source: texture.source, frame });
    image.texture = this.croppedTexture;
    image.setSize(w, h);
    image.position.set(x, y);
    image.visible = true;
  }
}
