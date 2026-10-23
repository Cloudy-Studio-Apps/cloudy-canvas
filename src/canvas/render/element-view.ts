import { Container, Graphics, GraphicsContext, Sprite, Text, type Texture } from "pixi.js";

import { type CanvasElement, type ElementKind, type ElementTextStyle } from "../elements";
import { rectsIntersect } from "../geometry";
import { rotatedBoundsAround, rotatePoint } from "../rotation";
import type { Rect } from "../geometry.types";
import { clipCovers } from "./clip-covers";
import { fitImage } from "./fit-image";
import type { ImageCache } from "./image-cache";
import type { ElementClip } from "./layer-placement.types";
import { PaintStack } from "./paint-stack";
import { RichTextSprite } from "./rich-text-sprite";
import type { RichTextLayout } from "../text/rich/rich-text.types";
import type { PaintLayer, PaintStackOptions } from "./paint-stack.types";
import { negativeHalfLeading } from "./text-leading";
import { textMaskTexture } from "./text-mask";
import { cappedTextResolution } from "./text-resolution";
import { canvasTextStyle } from "./text-style";
import type { CanvasTextOptions } from "./text-style.types";
import type { ImageCrop } from "../image";
import type { ImageFit } from "./element-view.types";

/** Opacity of a faded element (see `setFaded`). */
const FADED_ALPHA = 0.25;

/** Parsed icons, shared by every view that shows them (keyed by their SVG markup). */
const iconContexts = new Map<string, GraphicsContext>();

/** Pixi display object for one element. Redrawn in place by its kind whenever the element changes. */
export class ElementView extends Container {
  readonly elementId: string;
  /** Drawing order key (see `LayerPlacement`). */
  order: string;
  readonly graphics = new Graphics();
  private textNode: Text | null = null;
  /** A text laid out by the engine's rich layout (see `placeRichText`). */
  private richText: RichTextSprite | null = null;
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
  /** The text's glyphs the paints show through, instead of the text (see `setPaintTextMask`). */
  private textMask: Sprite | null = null;
  /** The mask of the area the element is clipped to (see `setClip`). */
  private clipMask: Graphics | null = null;
  private clipArea: ElementClip | null = null;
  /** The image asset the view shows, and the box it's fitted into (local coordinates). */
  private imageAsset: string | null = null;
  private imageBox: Rect = { x: 0, y: 0, w: 0, h: 0 };
  private imageFit: ImageFit | ImageCrop = "contain";
  /** The cropped view of a texture for `cover` or a crop (its source belongs to the image cache). */
  private croppedTexture: Texture | null = null;
  /** The element's bounds, which the entrance scales around (see `setEntrance`). */
  private bounds: Rect = { x: 0, y: 0, w: 0, h: 0 };
  /** What the view draws, in world units, worked out when first needed (see `extent`). */
  private drawn: Rect | null = null;
  /** Degrees the element is turned by around its top-left corner (`CanvasElement.rotation`). */
  private turn = 0;
  private entranceScale = 1;
  private entranceAlpha = 1;
  private faded = false;
  /** Clipped to nothing (what a hidden parent holds), or drawn by another element. */
  private clippedAway = false;
  private undrawn = false;

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
    this.turn = kind.rotatable ? (el.rotation ?? 0) : 0;
    this.drawn = null;
    this.placeScaled();
    this.setTextResolution(this.textResolution);
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
    this.drawn = null;
    if (!this.textNode) {
      this.textNode = new Text({ text: value, style, resolution: this.nodeResolution() });
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
    const wrapWidth = Math.max(1, w - style.padX * 2);
    const text = this.setText(value, { ...style, wrapWidth });
    // Lines tighter than the font sit higher, as in the editor; the block is its lines' height.
    const shift = negativeHalfLeading(text);
    const height = text.height + shift * 2;
    const x =
      style.align === "center"
        ? (w - text.width) / 2
        : style.align === "right"
          ? w - style.padX - text.width
          : style.padX;
    const y =
      style.vAlign === "middle"
        ? (h - height) / 2
        : style.vAlign === "bottom"
          ? h - style.padY - height
          : style.padY;
    text.position.set(x, y + shift);
    return text;
  }

  /**
   * Shows a laid-out text (spans in their own fonts and colors, `layoutRichText`) in the
   * element's frame, at `alpha`. Its glyphs are what `setPaintTextMask` shows paints through.
   */
  placeRichText(layout: RichTextLayout, alpha = 1): void {
    if (!this.richText) {
      this.richText = new RichTextSprite();
      this.richText.visible = this.textVisible;
      this.addChild(this.richText);
    }
    this.drawn = null;
    this.richText.alpha = alpha;
    this.richText.show(layout, this.nodeResolution());
  }

  /**
   * Shows an image asset in `box` (local coordinates), keeping its proportions: `contain` fits it
   * inside, centered; `cover` fills the box and crops what's outside; an `ImageCrop` fills the box
   * with that part of the picture. It appears once its texture has loaded.
   */
  placeImage(assetId: string, box: Rect, fit: ImageFit | ImageCrop = "contain"): void {
    if (!this.image) {
      this.image = new Sprite();
      this.addChildAt(this.image, this.getChildIndex(this.graphics) + 1);
    }
    this.drawn = null;
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
    if (!this.paintStack && layers.length === 0) return;
    if (!this.paintStack) {
      this.paintStack = new PaintStack(this.images);
      this.addChildAt(this.paintStack, this.getChildIndex(this.graphics) + 1);
    }
    this.drawn = null;
    this.paintStack.set(layers, options);
  }

  /**
   * Shows the paints (`setPaints`) only through the glyphs of the view's text, instead of the
   * text itself: a text filled with a gradient, an image or several paints. Draw the text white
   * first (`placeText`), then the paints; call it after each redraw. `false` draws the text again.
   */
  setPaintTextMask(masked: boolean): void {
    this.drawn = null;
    const text = this.richText ?? this.textNode;
    if (!masked || !text || !this.paintStack) {
      if (this.textMask) {
        if (this.paintStack) this.paintStack.mask = null;
        this.textMask.destroy({ texture: true, textureSource: true });
        this.textMask = null;
      }
      if (text) text.renderable = true;
      if (this.paintStack) this.paintStack.renderable = true;
      return;
    }
    const glyphs = this.textGlyphs(text);
    if (!glyphs) return;
    if (!this.textMask) {
      this.textMask = new Sprite();
      this.addChild(this.textMask);
    } else this.textMask.texture.destroy(true);
    this.textMask.texture = glyphs.texture;
    this.textMask.position.set(glyphs.x, glyphs.y);
    this.paintStack.mask = this.textMask;
    this.paintStack.renderable = this.textVisible;
    text.renderable = false;
  }

  /** The text's glyphs drawn white, and where they're placed. */
  private textGlyphs(
    text: Text | RichTextSprite,
  ): { texture: Texture; x: number; y: number } | null {
    if (text instanceof RichTextSprite) return text.maskTexture();
    const { texture, padding } = textMaskTexture(text);
    return { texture, x: text.x - padding, y: text.y - padding };
  }

  /**
   * Clips the element to a world area (e.g. the frame holding it, when that frame clips its
   * content); `null` shows all of it. Call it after `sync`, which places the view. A view that lies
   * inside the area gets no mask, since masks are costly to draw; an empty area (what a hidden
   * parent holds) isn't drawn at all.
   */
  setClip(clip: ElementClip | null): void {
    this.clipArea = clip;
    const hidden = !!clip && clip.rect.w <= 0 && clip.rect.h <= 0;
    this.clippedAway = hidden;
    this.applyVisible();
    if (this.clipMask) {
      this.mask = null;
      this.clipMask.destroy();
      this.clipMask = null;
      this.drawn = null;
    }
    if (!clip || hidden || clipCovers(clip, this.extent())) return;
    this.clipMask = new Graphics();
    this.addChild(this.clipMask);
    this.mask = this.clipMask;
    this.drawn = null;
    const { x, y, w, h } = clip.rect;
    const g = this.clipMask;
    const turn = clip.rotation ?? 0;
    if (turn === this.turn) {
      // Turned with the element (or neither is): a (rounded) rect in its frame.
      const local = this.worldToView(clip.rect);
      const radius = Math.min(clip.radius, w / 2, h / 2);
      if (radius > 0) g.roundRect(local.x, local.y, w, h, radius);
      else g.rect(local.x, local.y, w, h);
    } else {
      const corners = [
        { x, y },
        { x: x + w, y },
        { x: x + w, y: y + h },
        { x, y: y + h },
      ].map((p) => this.worldToView(rotatePoint(p, clip.rect, turn)));
      g.poly(corners.flatMap((p) => [p.x, p.y]));
    }
    g.fill({ color: 0xffffff });
  }

  /** The world area the element is clipped to, as last set (`null`: not clipped). */
  get clip(): ElementClip | null {
    return this.clipArea;
  }

  /**
   * Whether the view is drawn: not when another element draws it (e.g. a boolean draws its
   * operands combined). It's still placed, so it's ready when it's drawn again.
   */
  setDrawn(drawn: boolean): void {
    this.undrawn = !drawn;
    this.applyVisible();
  }

  private applyVisible(): void {
    const visible = !this.clippedAway && !this.undrawn;
    if (this.visible !== visible) this.visible = visible;
  }

  /** The world area the view draws in (its masked area when it's clipped). */
  extent(): Rect {
    if (!this.drawn) {
      const { minX, minY, width, height } = this.getLocalBounds();
      const { x, y } = this.bounds;
      const local = { x: x + minX, y: y + minY, w: width, h: height };
      this.drawn = rotatedBoundsAround(local, this.bounds, this.turn);
    }
    return this.drawn;
  }

  /** Skips drawing the view while it's outside `visible` (a world rect), unless it's popping in. */
  cull(visible: Rect): void {
    const shown = this.entranceScale !== 1 || rectsIntersect(this.extent(), visible);
    if (this.culled === shown) this.culled = !shown;
  }

  /** Creates or updates the label stored under `key` (positioned by the caller). */
  setTextSlot(key: string, value: string, options: CanvasTextOptions): Text {
    const style = canvasTextStyle(options);
    this.drawn = null;
    let node = this.textSlots.get(key);
    if (!node) {
      node = new Text({ text: value, style, resolution: this.nodeResolution() });
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
    this.drawn = null;
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
    this.drawn = null;
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
    this.drawn = null;
    if (this.textNode) this.textNode.visible = visible;
    if (this.richText) this.richText.visible = visible;
    // Paints shown through the text hide with it (while it's edited).
    if (this.textMask && this.paintStack) this.paintStack.renderable = visible;
  }

  /** Hides only the text slot `key` (`null` shows them all), e.g. the table cell being edited. */
  setHiddenSlot(key: string | null): void {
    const shown = this.hiddenSlot ? this.textSlots.get(this.hiddenSlot) : undefined;
    if (shown) shown.visible = true;
    this.hiddenSlot = key;
    this.drawn = null;
    const hidden = key ? this.textSlots.get(key) : undefined;
    if (hidden) hidden.visible = false;
  }

  /** The resolution its texts are drawn at, capped by its size (see `cappedTextResolution`). */
  setTextResolution(resolution: number): void {
    this.textResolution = resolution;
    const capped = this.nodeResolution();
    for (const node of [this.textNode, ...this.textSlots.values()]) {
      if (node && node.resolution !== capped) node.resolution = capped;
    }
    this.richText?.setResolution(capped);
  }

  /** Lays its texts out again (a font they use has just loaded, so they measure differently). */
  refreshText(): void {
    this.drawn = null;
    for (const node of [this.textNode, ...this.textSlots.values()]) node?.style.update();
    this.richText?.redraw();
    // Glyphs the paints show through are drawn again in the loaded font.
    if (this.textMask) this.setPaintTextMask(true);
  }

  /** Hides the image shown with `placeImage`, if any. */
  clearImage(): void {
    this.imageAsset = null;
    this.drawn = null;
    if (this.image) this.image.visible = false;
  }

  override destroy(options?: Parameters<Container["destroy"]>[0]): void {
    this.croppedTexture?.destroy(false);
    this.croppedTexture = null;
    super.destroy(options);
  }

  private nodeResolution(): number {
    return cappedTextResolution(this.textResolution, Math.max(this.bounds.w, this.bounds.h));
  }

  private applyAlpha(): void {
    this.alpha = this.entranceAlpha * (this.faded ? FADED_ALPHA : 1);
  }

  /** Places the view: at the element's corner, turned, and scaled round its center (entrance). */
  private placeScaled(): void {
    const { x, y, w, h } = this.bounds;
    const s = this.entranceScale;
    this.scale.set(s);
    this.rotation = (-this.turn * Math.PI) / 180;
    // The scaled center lands on the element's (turned) center.
    const origin = { x: 0, y: 0 };
    const center = rotatePoint({ x: w / 2, y: h / 2 }, origin, this.turn);
    const scaled = rotatePoint({ x: (w * s) / 2, y: (h * s) / 2 }, origin, this.turn);
    this.position.set(x + center.x - scaled.x, y + center.y - scaled.y);
  }

  /** A world point in the view's own (unturned, unscaled) coordinates. */
  private worldToView(p: { x: number; y: number }): { x: number; y: number } {
    const q = rotatePoint(p, this.bounds, -this.turn);
    return { x: q.x - this.bounds.x, y: q.y - this.bounds.y };
  }

  private fitImage(texture: Texture): void {
    this.drawn = null;
    this.croppedTexture = fitImage(
      this.image!,
      texture,
      this.imageBox,
      this.imageFit,
      this.croppedTexture,
    );
  }
}
