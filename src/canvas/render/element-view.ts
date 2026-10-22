import { Container, Graphics, GraphicsContext, Sprite, Text, type Texture } from "pixi.js";

import { type CanvasElement, type ElementKind, type ElementTextStyle } from "../elements";
import type { Rect } from "../geometry.types";
import { fitImage } from "./fit-image";
import type { ImageCache } from "./image-cache";
import { PaintStack } from "./paint-stack";
import type { PaintLayer, PaintStackOptions } from "./paint-stack.types";
import { canvasTextStyle } from "./text-style";
import type { CanvasTextOptions } from "./text-style.types";
import type { ImageFit } from "./element-view.types";

/** Opacity of a faded element (see `setFaded`). */
const FADED_ALPHA = 0.25;

/** Parsed icons, shared by every view that shows them (keyed by their SVG markup). */
const iconContexts = new Map<string, GraphicsContext>();

/** Pixi display object for one element. Redrawn in place by its kind whenever the element changes. */
export class ElementView extends Container {
  readonly elementId: string;
  /** Drawing order key (see `OrderKeyOf`). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  /** Extra keyed labels, for elements that show several (e.g. a table's column names). */
  private readonly textSlots = new Map<string, Text>();
  /** Extra keyed graphics drawn above the image (e.g. a play button over a thumbnail). */
  private readonly layers = new Map<string, Graphics>();
  private textVisible = true;
  /** The text slot the text editor is showing instead (e.g. a table cell being edited). */
  private hiddenSlot: string | null = null;
  private textResolution = 1;
  private image: Sprite | null = null;
  private paintStack: PaintStack | null = null;
  /** The image asset the view shows, and the box it's fitted into (local coordinates). */
  private imageAsset: string | null = null;
  private imageBox: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private imageFit: ImageFit = "contain";
  /** The cropped view of a texture for `cover` (its source belongs to the image cache). */
  private croppedTexture: Texture | null = null;
  /** The element's bounds, which the entrance scales around (see `setEntrance`). */
  private bounds: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private entranceScale = 1;
  private entranceAlpha = 1;
  private faded = false;

  constructor(
    el: CanvasElement,
    kind: ElementKind,
    private readonly images: ImageCache,
    order = "",
  ) {
    super();
    this.elementId = el.id;
    this.order = order;
    this.addChild(this.graphics);
    this.sync(el, kind, order);
  }

  /** Moves the view to the element and has its kind redraw it. */
  sync(el: CanvasElement, kind: ElementKind, order = this.order): void {
    this.order = order;
    this.bounds = { x: el.x, y: el.y, w: el.w, h: el.h };
    this.placeScaled();
    kind.draw(this, el);
  }

  /** Scales the view around its center and fades it, while it plays its entrance (1 when done). */
  setEntrance(scale: number, alpha: number): void {
    this.entranceScale = scale;
    this.entranceAlpha = alpha;
    this.applyAlpha();
    this.placeScaled();
  }

  /** Dims the element, e.g. while a tool is about to remove it. */
  setFaded(faded: boolean): void {
    this.faded = faded;
    this.applyAlpha();
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

  /**
   * Draws the element's paints, bottom to top, just above its base graphics: vector shapes (fills,
   * strokes) and images clipped to an outline (e.g. a design node's image fill). Replaces what the
   * previous call drew; `alpha` and `visible` apply to all of them.
   */
  setPaints(layers: readonly PaintLayer[], options: PaintStackOptions): void {
    if (!this.paintStack) {
      this.paintStack = new PaintStack(this.images);
      this.addChildAt(this.paintStack, this.getChildIndex(this.graphics) + 1);
    }
    this.paintStack.set(layers, options);
  }

  /** Creates or updates the label stored under `key` (positioned by the caller). */
  setTextSlot(key: string, value: string, options: CanvasTextOptions): Text {
    const style = canvasTextStyle(options);
    let node = this.textSlots.get(key);
    if (!node) {
      node = new Text({ text: value, style, resolution: this.textResolution });
      node.visible = key !== this.hiddenSlot;
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

  /** Hides only the text slot `key` (`null` shows them all), e.g. the table cell being edited. */
  setHiddenSlot(key: string | null): void {
    const shown = this.hiddenSlot ? this.textSlots.get(this.hiddenSlot) : undefined;
    if (shown) shown.visible = true;
    this.hiddenSlot = key;
    const hidden = key ? this.textSlots.get(key) : undefined;
    if (hidden) hidden.visible = false;
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

  private applyAlpha(): void {
    this.alpha = this.entranceAlpha * (this.faded ? FADED_ALPHA : 1);
  }

  private placeScaled(): void {
    const { x, y, w, h } = this.bounds;
    const s = this.entranceScale;
    this.scale.set(s);
    this.position.set(x + (w * (1 - s)) / 2, y + (h * (1 - s)) / 2);
  }

  private fitImage(texture: Texture): void {
    this.croppedTexture = fitImage(
      this.image!,
      texture,
      this.imageBox,
      this.imageFit,
      this.croppedTexture,
    );
  }
}
