import { createId } from "@shared/core";

import type { FigContainer } from "../container";
import type { FigGuid, FigStyleRef } from "./fig-node.types";
import { guidKey } from "./fig-tree";
import { ImportWarnings } from "./import-warnings";

/** What converting a file's nodes shares: its blobs and images, and what it has collected. */
export class FigImportContext {
  readonly warnings = new ImportWarnings();
  /** Document assets to add: image files by their new asset id. */
  readonly assets = new Map<string, Uint8Array>();
  private readonly blobs: readonly Uint8Array[];
  private readonly images: ReadonlyMap<string, Uint8Array>;
  /** Asset ids by image hash, so every paint of one image shares its asset. */
  private readonly assetIds = new Map<string, string>();
  /** The ids given to the file's variables and styles: by guid, and styles by library key. */
  private readonly tokenIds = new Map<string, string>();
  /** The file's variables' values (in each collection's first mode), by guid. */
  private readonly tokenValues = new Map<string, string | number | boolean>();

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

  /** Records the id a variable or style (by its guid, and a style's library key) was given. */
  setTokenId(guid: FigGuid | undefined, id: string, key?: string): void {
    if (guid) this.tokenIds.set(guidKey(guid), id);
    if (key) this.tokenIds.set(`key:${key}`, id);
  }

  /** The id a variable or style the file holds was given, or `null` (not in the file). */
  tokenId(guid: FigGuid | undefined): string | null {
    return guid ? (this.tokenIds.get(guidKey(guid)) ?? null) : null;
  }

  /** The id of the style a node's reference names, or `null` when the file doesn't hold it. */
  styleId(ref: FigStyleRef | undefined): string | null {
    if (ref?.guid) {
      const id = this.tokenIds.get(guidKey(ref.guid));
      if (id) return id;
    }
    const key = ref?.assetRef?.key;
    return key ? (this.tokenIds.get(`key:${key}`) ?? null) : null;
  }

  /** Records a variable's value, which what's bound to it shows (a color as `#RRGGBBAA`). */
  setTokenValue(guid: FigGuid | undefined, value: string | number | boolean): void {
    if (guid) this.tokenValues.set(guidKey(guid), value);
  }

  /** The value of the variable a field is bound to, when the file holds it. */
  tokenValue(guid: FigGuid | undefined): string | number | boolean | undefined {
    return guid ? this.tokenValues.get(guidKey(guid)) : undefined;
  }
}
