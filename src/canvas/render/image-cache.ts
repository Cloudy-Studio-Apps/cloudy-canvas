import { ImageSource, Texture } from "pixi.js";

import type { Size } from "../geometry.types";
import { Emitter } from "../utils";
import { decodeImage, isVectorImage, knownImageSize } from "./decode-image";
import { ExportImages } from "./export-images";
import type {
  CachedImage,
  ImageCacheHost,
  ImageDemand,
  ImageQuality,
  ImageTextures,
  ImageUpgradeListener,
} from "./image-cache.types";
import { BASE_LEVEL, levelFor, MAX_LEVEL, textureBytes } from "./image-levels";

/** How long the demand must stay put (a zoom has stopped) before pictures change level. */
const SETTLE_MS = 150;

/** Sharper levels decoded at once. */
const MAX_DECODES = 2;

/** GPU memory the textures may take before the sharp levels of pictures out of view are let go. */
const TEXTURE_BUDGET_BYTES = 768 * 1024 * 1024;

/** The picture's sharpest loaded level (0 when none is). */
function bestLevel(entry: CachedImage): number {
  let best = 0;
  for (const level of entry.levels.keys()) best = Math.max(best, level);
  return best;
}

function sizeOf(texture: Texture): number {
  return textureBytes(texture.width, texture.height);
}

/**
 * The canvas's image textures, decoded from the document's assets and shared by every view that
 * shows one (copies of an image share their asset). Each picture loads at a small base level
 * (`BASE_LEVEL`), and the views on screen say how sharp they need it (`want`, every frame): once
 * that settles, each picture on screen moves to the level it shows at (sharper when zoomed into,
 * back down when zoomed out) and the views showing it draw again (`onUpgrade`). Past
 * `TEXTURE_BUDGET_BYTES`, the sharp levels of pictures out of view are let go too. Images that can't be decoded are remembered as missing.
 */
export class ImageCache implements ImageTextures {
  private readonly entries = new Map<string, CachedImage>();
  private readonly missing = new Set<string>();
  private round = 0;
  /** How many pictures the latest demand round asked for. */
  private shown = 0;
  private settle: ReturnType<typeof setTimeout> | null = null;
  private decoding = 0;
  private destroyed = false;
  /**
   * Fires when what `quality` reports changes: a picture's texture (loaded, sharper, let go) or
   * how large the pictures on screen show.
   */
  readonly changes = new Emitter();

  constructor(
    private readonly host: ImageCacheHost,
    private readonly onUpgrade: ImageUpgradeListener,
  ) {}

  /** The asset's sharpest loaded texture, otherwise `null`. */
  get(assetId: string): Texture | null {
    const entry = this.entries.get(assetId);
    return (entry && entry.levels.get(bestLevel(entry))) ?? null;
  }

  /** The picture's own size in pixels (its texture may be smaller), once it's known. */
  naturalSize(assetId: string): Size | null {
    return this.entry(assetId)?.natural ?? null;
  }

  /** How sharp the canvas shows the picture now, or `null` before its size is known. */
  quality(assetId: string): ImageQuality | null {
    const entry = this.entry(assetId);
    if (!entry?.natural) return null;
    const texture = this.get(assetId);
    return {
      natural: entry.natural,
      shown: texture && { w: texture.width, h: texture.height },
      vector: entry.vector,
      onScreen: entry.seen === this.round && entry.seen > 0 ? entry.wanted : null,
    };
  }

  /**
   * Loads the asset's base level (once); resolves to its sharpest texture, or `null` when it can't
   * be decoded or isn't in the document yet (asked again next time).
   */
  load(assetId: string): Promise<Texture | null> {
    const entry = this.entry(assetId);
    if (!entry) return Promise.resolve(null);
    const texture = this.get(assetId);
    if (texture) return Promise.resolve(texture);
    entry.loading ??= this.decodeBase(assetId, entry);
    return entry.loading;
  }

  /**
   * What the views on screen need (pixels on each picture's long side), the largest per asset.
   * Sharper levels are decoded once it stops asking for more for `SETTLE_MS`.
   */
  want(demands: readonly ImageDemand[]): void {
    this.round++;
    let changed = false;
    let moved = false;
    let shown = 0;
    for (const { assetId, pixels } of demands) {
      const entry = this.entries.get(assetId);
      if (!entry?.natural) continue;
      shown++;
      if (entry.seen !== this.round - 1 || entry.wanted !== pixels) moved = true;
      entry.seen = this.round;
      const target = this.target(entry, pixels);
      if (target !== this.current(entry) && target !== this.target(entry, entry.wanted))
        changed = true;
      entry.wanted = pixels;
    }
    // A picture left the view.
    if (shown !== this.shown) moved = true;
    this.shown = shown;
    if (moved) this.changes.emit();
    if (!changed) return;
    if (this.settle) clearTimeout(this.settle);
    this.settle = setTimeout(() => {
      this.settle = null;
      this.settleLevels();
    }, SETTLE_MS);
  }

  /** A cache for one export, decoding pictures at the size it draws them (see `ExportImages`). */
  forExport(maxPixels: number): ExportImages {
    return new ExportImages({
      read: (assetId) => this.host.read(assetId),
      naturalSize: (assetId) => this.naturalSize(assetId),
      cached: (assetId, pixels) => this.atLeast(assetId, pixels),
      maxPixels,
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.changes.clear();
    if (this.settle) clearTimeout(this.settle);
    for (const entry of this.entries.values())
      for (const texture of entry.levels.values()) texture.destroy(true);
    this.entries.clear();
  }

  /** The asset's smallest loaded texture at least `pixels` on its long side, if any. */
  private atLeast(assetId: string, pixels: number): Texture | null {
    const entry = this.entries.get(assetId);
    if (!entry) return null;
    let found: Texture | null = null;
    for (const texture of entry.levels.values()) {
      const long = Math.max(texture.width, texture.height);
      if (long >= Math.floor(pixels) && (!found || long < Math.max(found.width, found.height)))
        found = texture;
    }
    return found;
  }

  /** The asset's entry, made on first ask; `null` when it's missing or not in the document. */
  private entry(assetId: string): CachedImage | null {
    const known = this.entries.get(assetId);
    if (known) return known;
    if (this.missing.has(assetId)) return null;
    const data = this.host.read(assetId);
    if (!data) return null;
    const entry: CachedImage = {
      natural: knownImageSize(data),
      vector: isVectorImage(data),
      levels: new Map(),
      base: 0,
      loading: null,
      upgrading: null,
      wanted: 0,
      seen: 0,
    };
    this.entries.set(assetId, entry);
    return entry;
  }

  /** The level that shows `pixels` sharply, never below the base. */
  private target(entry: CachedImage, pixels: number): number {
    const own =
      entry.vector || !entry.natural ? MAX_LEVEL : Math.max(entry.natural.w, entry.natural.h);
    return Math.max(entry.base, levelFor(pixels, own));
  }

  /** The level shown or on its way. */
  private current(entry: CachedImage): number {
    return Math.max(bestLevel(entry), entry.upgrading ?? 0);
  }

  private async decodeBase(assetId: string, entry: CachedImage): Promise<Texture | null> {
    try {
      const { bitmap, natural } = await decodeImage(
        this.host.read(assetId)!,
        BASE_LEVEL,
        entry.natural,
      );
      if (this.destroyed) {
        bitmap.close();
        return null;
      }
      entry.natural = natural;
      entry.base = this.target({ ...entry, base: 0 }, BASE_LEVEL);
      const texture = this.store(entry, entry.base, bitmap);
      this.host.onLoad();
      this.changes.emit();
      return texture;
    } catch (error) {
      console.warn("[canvas] Couldn't decode image", assetId, error);
      this.entries.delete(assetId);
      this.missing.add(assetId);
      return null;
    }
  }

  /**
   * Brings the pictures on screen to the level they show at, once the view has settled: sharper
   * ones are decoded (two at a time, the most wanted first); ones zoomed out of a sharp level go
   * back down, to the base at once or to a smaller level decoded anew, so the canvas works with
   * light textures again. Pictures out of view keep theirs until the budget needs the memory.
   */
  private settleLevels(): void {
    const lower = new Set<string>();
    const freed: Texture[] = [];
    const queue: [string, CachedImage, number][] = [];
    for (const [assetId, entry] of this.entries) {
      if (entry.seen !== this.round || entry.upgrading !== null || entry.base === 0) continue;
      const target = this.target(entry, entry.wanted);
      const best = bestLevel(entry);
      if (target === best) continue;
      if (target === entry.base) {
        freed.push(...this.dropLevels(entry, target));
        lower.add(assetId);
      } else queue.push([assetId, entry, target]);
    }
    if (lower.size > 0) {
      this.onUpgrade(lower);
      this.free(freed);
      this.host.onLoad();
      this.changes.emit();
    }
    queue.sort(([, a], [, b]) => b.wanted - a.wanted);
    for (const [assetId, entry, target] of queue) {
      if (this.decoding >= MAX_DECODES) return;
      void this.decodeLevel(assetId, entry, target);
    }
  }

  /** Takes out the entry's levels but the base and `keep`; returns their textures to free. */
  private dropLevels(entry: CachedImage, keep: number): Texture[] {
    const dropped = [...entry.levels].filter(([at]) => at !== entry.base && at !== keep);
    for (const [at] of dropped) entry.levels.delete(at);
    return dropped.map(([, texture]) => texture);
  }

  private async decodeLevel(assetId: string, entry: CachedImage, level: number): Promise<void> {
    const data = this.host.read(assetId);
    if (!data) return;
    this.decoding++;
    entry.upgrading = level;
    try {
      const { bitmap } = await decodeImage(data, level, entry.natural);
      if (this.destroyed) return bitmap.close();
      // The level it showed before (sharper or not) isn't shown any more; the base stays.
      const replaced = this.dropLevels(entry, level);
      this.store(entry, level, bitmap);
      this.onUpgrade(new Set([assetId]));
      this.free(replaced);
      this.enforceBudget();
      this.host.onLoad();
      this.changes.emit();
    } catch (error) {
      console.warn("[canvas] Couldn't decode an image level", assetId, error);
    } finally {
      entry.upgrading = null;
      this.decoding--;
    }
    if (!this.destroyed) this.settleLevels();
  }

  private store(entry: CachedImage, level: number, bitmap: ImageBitmap): Texture {
    // Mipmaps keep pictures smooth when zoomed out.
    const source = new ImageSource({ resource: bitmap, autoGenerateMipmaps: true });
    const texture = new Texture({ source });
    entry.levels.set(level, texture);
    return texture;
  }

  /**
   * Past the budget, lets go of the sharp levels of the pictures asked for longest ago (never the
   * ones on screen, never a base level); their views draw again with what's left.
   */
  private enforceBudget(): void {
    let total = 0;
    for (const entry of this.entries.values())
      for (const texture of entry.levels.values()) total += sizeOf(texture);
    if (total <= TEXTURE_BUDGET_BYTES) return;
    const changed = new Set<string>();
    const freed: Texture[] = [];
    const stale = [...this.entries]
      .filter(([, entry]) => entry.seen !== this.round)
      .sort(([, a], [, b]) => a.seen - b.seen);
    for (const [assetId, entry] of stale) {
      for (const [level, texture] of [...entry.levels].sort(([a], [b]) => b - a)) {
        if (total <= TEXTURE_BUDGET_BYTES || level === entry.base) break;
        entry.levels.delete(level);
        total -= sizeOf(texture);
        freed.push(texture);
        changed.add(assetId);
      }
      if (total <= TEXTURE_BUDGET_BYTES) break;
    }
    if (changed.size === 0) return;
    this.onUpgrade(changed);
    this.free(freed);
    this.changes.emit();
  }

  /** Destroys textures the views stopped showing, once the frame that last drew them is done. */
  private free(textures: readonly Texture[]): void {
    if (textures.length === 0) return;
    requestAnimationFrame(() => {
      for (const texture of textures) texture.destroy(true);
    });
  }
}
