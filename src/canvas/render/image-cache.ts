import { ImageSource, Texture } from "pixi.js";

import type { ImageCacheHost } from "./image-cache.types";

/**
 * One texture per image asset, decoded on first use and shared by every view that shows it (copies
 * of an image share their asset). Images that can't be decoded are remembered as missing.
 */
export class ImageCache {
  private readonly textures = new Map<string, Texture>();
  private readonly loading = new Map<string, Promise<Texture | null>>();
  private destroyed = false;

  constructor(private readonly host: ImageCacheHost) {}

  /** The asset's texture if it's loaded, otherwise `null`. */
  get(assetId: string): Texture | null {
    return this.textures.get(assetId) ?? null;
  }

  /**
   * Loads the asset's texture (once); resolves to `null` when it can't be decoded, or isn't in the
   * document yet (asked again next time).
   */
  load(assetId: string): Promise<Texture | null> {
    const texture = this.textures.get(assetId);
    if (texture) return Promise.resolve(texture);
    if (!this.host.read(assetId)) return Promise.resolve(null);
    let pending = this.loading.get(assetId);
    if (!pending) {
      pending = this.decode(assetId);
      this.loading.set(assetId, pending);
    }
    return pending;
  }

  destroy(): void {
    this.destroyed = true;
    for (const texture of this.textures.values()) texture.destroy(true);
    this.textures.clear();
  }

  private async decode(assetId: string): Promise<Texture | null> {
    const data = this.host.read(assetId)!;
    try {
      const bitmap = await createImageBitmap(new Blob([data as Uint8Array<ArrayBuffer>]));
      if (this.destroyed) {
        bitmap.close();
        return null;
      }
      // Mipmaps keep large images smooth when zoomed out.
      const source = new ImageSource({ resource: bitmap, autoGenerateMipmaps: true });
      const texture = new Texture({ source });
      this.textures.set(assetId, texture);
      this.host.onLoad();
      return texture;
    } catch (error) {
      console.warn("[canvas] Couldn't decode image", assetId, error);
      return null;
    }
  }
}
