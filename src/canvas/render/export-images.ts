import { ImageSource, Texture } from "pixi.js";

import type { Size } from "../geometry.types";
import { decodeImage, isVectorImage, knownImageSize } from "./decode-image";
import type { ImageDemand, ImageTextures } from "./image-cache.types";
import type { ExportImagesHost } from "./export-images.types";

/**
 * The textures of one export (see `drawSnapshot`): each picture at the size the export draws it
 * at (`prepare`), up to its own pixels, so exports are as sharp as the originals whatever the
 * canvas shows. A canvas texture that's sharp enough is borrowed (small exports, thumbnails);
 * the others are decoded from the files. Lives for one snapshot; `destroy` frees what it decoded.
 */
export class ExportImages implements ImageTextures {
  private readonly textures = new Map<string, Texture>();
  private readonly borrowed = new Map<string, Texture>();
  private readonly sizes = new Map<string, Size | null>();
  private destroyed = false;

  constructor(private readonly host: ExportImagesHost) {}

  get(assetId: string): Texture | null {
    return this.textures.get(assetId) ?? this.borrowed.get(assetId) ?? null;
  }

  /** What `prepare` gave; views made before it show their pictures when drawn again. */
  load(assetId: string): Promise<Texture | null> {
    return Promise.resolve(this.get(assetId));
  }

  naturalSize(assetId: string): Size | null {
    if (!this.sizes.has(assetId)) {
      const data = this.host.read(assetId);
      const size = (data && knownImageSize(data)) ?? this.host.naturalSize(assetId);
      this.sizes.set(assetId, size);
    }
    return this.sizes.get(assetId) ?? null;
  }

  /** Gets each asset at what it's asked for (capped at its own size and `maxPixels`). */
  async prepare(demands: readonly ImageDemand[]): Promise<void> {
    const sized = demands.map((demand) => ({ ...demand, pixels: this.sizeFor(demand) }));
    await Promise.all(
      sized.filter((d) => !this.host.cached(d.assetId, d.pixels)).map((d) => this.decode(d)),
    );
    // Borrowed last, right before drawing, so the canvas can't let them go in between; one it
    // let go of while the others decoded is decoded after all.
    const late: ImageDemand[] = [];
    for (const demand of sized) {
      if (this.textures.has(demand.assetId)) continue;
      const texture = this.host.cached(demand.assetId, demand.pixels);
      if (texture) this.borrowed.set(demand.assetId, texture);
      else late.push(demand);
    }
    if (late.length > 0) await Promise.all(late.map((d) => this.decode(d)));
  }

  destroy(): void {
    this.destroyed = true;
    for (const texture of this.textures.values()) texture.destroy(true);
    this.textures.clear();
    this.borrowed.clear();
  }

  /** The texture size a demand gets: at most the picture's own pixels and `maxPixels`. */
  private sizeFor({ assetId, pixels }: ImageDemand): number {
    const data = this.host.read(assetId);
    const natural = this.naturalSize(assetId);
    const own = natural && data && !isVectorImage(data) ? Math.max(natural.w, natural.h) : Infinity;
    return Math.max(1, Math.min(pixels, own, this.host.maxPixels));
  }

  private async decode({ assetId, pixels }: ImageDemand): Promise<void> {
    const data = this.host.read(assetId);
    if (!data) return;
    try {
      const { bitmap } = await decodeImage(data, pixels, this.naturalSize(assetId));
      if (this.destroyed) return bitmap.close();
      const source = new ImageSource({ resource: bitmap, autoGenerateMipmaps: true });
      this.textures.set(assetId, new Texture({ source }));
    } catch (error) {
      console.warn("[canvas] Couldn't decode image for export", assetId, error);
    }
  }
}
