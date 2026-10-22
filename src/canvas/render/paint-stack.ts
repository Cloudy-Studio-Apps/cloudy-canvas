import { Container, Graphics, Sprite, type Texture } from "pixi.js";

import { fitImage } from "./fit-image";
import type { ImageCache } from "./image-cache";
import type { ImagePaintLayer, PaintLayer, PaintStackOptions } from "./paint-stack.types";

/** A drawn image paint: its sprite, the mask clipping it and the crop it shows. */
class ImageSlot extends Container {
  readonly kind = "image";
  private readonly sprite = new Sprite();
  private readonly clip = new Graphics();
  private cropped: Texture | null = null;
  private assetId: string | null = null;

  constructor(private readonly images: ImageCache) {
    super();
    this.sprite.mask = this.clip;
    this.addChild(this.clip, this.sprite);
  }

  draw(layer: ImagePaintLayer): void {
    this.clip.clear();
    layer.mask(this.clip);
    this.clip.fill({ color: 0xffffff });
    this.sprite.alpha = layer.alpha;
    this.assetId = layer.assetId;
    const texture = this.images.get(layer.assetId);
    if (texture) return this.fit(texture, layer);
    this.sprite.visible = false;
    void this.images.load(layer.assetId).then((loaded) => {
      if (loaded && !this.destroyed && this.assetId === layer.assetId) this.fit(loaded, layer);
    });
  }

  override destroy(options?: Parameters<Container["destroy"]>[0]): void {
    this.cropped?.destroy(false);
    this.cropped = null;
    super.destroy(options);
  }

  private fit(texture: Texture, layer: ImagePaintLayer): void {
    this.cropped = fitImage(this.sprite, texture, layer.box, layer.fit, this.cropped);
  }
}

/** A drawn vector paint. */
class ShapeSlot extends Graphics {
  readonly kind = "shape";
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
      else layer.draw((slot as ShapeSlot).clear());
    });
    for (const extra of this.children.slice(layers.length)) extra.destroy({ children: true });
  }
}
