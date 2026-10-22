import { createId } from "@shared/core";

import type { FigContainer } from "../container";
import { ImportWarnings } from "./import-warnings";

/** What converting a file's nodes shares: its blobs and images, and what it has collected. */
export class ImportContext {
  readonly warnings = new ImportWarnings();
  /** Document assets to add: image files by their new asset id. */
  readonly assets = new Map<string, Uint8Array>();
  private readonly blobs: readonly Uint8Array[];
  private readonly images: ReadonlyMap<string, Uint8Array>;
  /** Asset ids by image hash, so every paint of one image shares its asset. */
  private readonly assetIds = new Map<string, string>();

  constructor(container: FigContainer) {
    const blobs = container.message.blobs;
    this.blobs = Array.isArray(blobs)
      ? blobs.map((blob) => (blob as { bytes?: Uint8Array }).bytes ?? new Uint8Array())
      : [];
    this.images = container.images;
  }

  blob(index: number | undefined): Uint8Array | null {
    return index === undefined ? null : (this.blobs[index] ?? null);
  }

  /** The asset holding the image with this hash (hex), or `null` when the file lacks it. */
  imageAsset(hash: string): string | null {
    const known = this.assetIds.get(hash);
    if (known) return known;
    const data = this.images.get(hash);
    if (!data) return null;
    const id = createId();
    this.assetIds.set(hash, id);
    this.assets.set(id, data);
    return id;
  }
}
