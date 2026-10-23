import { Container, Graphics, Sprite, TilingSprite, type Texture } from "pixi.js";

import { fitTransform } from "../image";
import { acquireGradient, gradientFillStyle, releaseGradient } from "./gradient-texture";
import type { ImageCache } from "./image-cache";
import { imageMatrix } from "./image-matrix";
import type {
  ImagePaintLayer,
  PaintLayer,
  PaintStackOptions,
  PaintTools,
  ShapePaintLayer,
} from "./paint-stack.types";

/** A drawn image paint: its picture (a sprite, or a tiling sprite when tiled) and its clip. */
class ImageSlot extends Container {
  readonly kind = "image";
  private picture: Sprite | TilingSprite | null = null;
  private readonly clip = new Graphics();
  private assetId: string | null = null;

  constructor(private readonly images: ImageCache) {
    super();
    this.addChild(this.clip);
  }

  draw(layer: ImagePaintLayer): void {
    this.clip.clear();
    layer.mask(this.clip);
    this.assetId = layer.assetId;
    const texture = this.images.get(layer.assetId);
    if (texture) return this.show(texture, layer);
    if (this.picture) this.picture.visible = false;
    void this.images.load(layer.assetId).then((loaded) => {
      if (loaded && !this.destroyed && this.assetId === layer.assetId) this.show(loaded, layer);
    });
  }

  private show(texture: Texture, layer: ImagePaintLayer): void {
    const { placement, box } = layer;
    const size = { w: texture.width, h: texture.height };
    if (placement.mode === "tile") {
      const tiles = this.pictureOf(TilingSprite);
      tiles.texture = texture;
      tiles.position.set(box.x, box.y);
      tiles.setSize(box.w, box.h);
      // A tile is the picture's own pixel size times the scale (its texture may be smaller).
      const natural = this.images.naturalSize(layer.assetId) ?? size;
      tiles.tileScale.set(
        (placement.scale * natural.w) / size.w,
        (placement.scale * natural.h) / size.h,
      );
      tiles.tileRotation = ((placement.rotation ?? 0) * Math.PI) / 180;
      tiles.alpha = layer.alpha;
      tiles.visible = true;
      return;
    }
    const sprite = this.pictureOf(Sprite);
    sprite.texture = texture;
    const transform =
      placement.mode === "transform"
        ? placement.transform
        : fitTransform(placement.mode, box, size, placement.rotation);
    sprite.setFromMatrix(imageMatrix(transform, box, size));
    sprite.alpha = layer.alpha;
    sprite.visible = true;
  }

  /** The picture as a `type`, made anew (and masked) when it was the other kind. */
  private pictureOf<T extends Sprite | TilingSprite>(type: new () => T): T {
    if (this.picture instanceof type) return this.picture;
    this.picture?.destroy();
    const picture = new type();
    picture.mask = this.clip;
    this.addChild(picture);
    this.picture = picture;
    return picture;
  }
}

/** A drawn vector paint, holding the gradient textures it paints with. */
class ShapeSlot extends Graphics {
  readonly kind = "shape";
  private gradients: string[] = [];

  drawLayer(layer: ShapePaintLayer): void {
    const previous = this.gradients;
    this.gradients = [];
    const tools: PaintTools = {
      gradient: (gradient, box, alpha) => {
        const { key, texture } = acquireGradient(gradient);
        this.gradients.push(key);
        return gradientFillStyle(texture, box, alpha);
      },
    };
    layer.draw(this.clear(), tools);
    // Released after drawing, so a gradient drawn again isn't freed and drawn anew in between.
    previous.forEach(releaseGradient);
  }

  override destroy(options?: Parameters<Graphics["destroy"]>[0]): void {
    this.gradients.forEach(releaseGradient);
    this.gradients = [];
    super.destroy(options);
  }
}

/**
 * An element's paints, bottom to top (see `ElementView.setPaints`). Each call redraws the layers
 * in place, reusing the drawn objects position by position.
 */
export class PaintStack extends Container<ImageSlot | ShapeSlot> {
  constructor(private readonly images: ImageCache) {
    super();
  }

  set(layers: readonly PaintLayer[], { alpha, visible }: PaintStackOptions): void {
    this.alpha = alpha;
    this.visible = visible;
    layers.forEach((layer, i) => {
      let slot = this.children[i];
      if (slot?.kind !== layer.kind) {
        slot?.destroy({ children: true });
        slot = layer.kind === "image" ? new ImageSlot(this.images) : new ShapeSlot();
        this.addChildAt(slot, i);
      }
      if (layer.kind === "image") (slot as ImageSlot).draw(layer);
      else (slot as ShapeSlot).drawLayer(layer);
    });
    for (const extra of this.children.slice(layers.length)) extra.destroy({ children: true });
  }
}
