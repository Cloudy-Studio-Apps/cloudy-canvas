import type { LibraryAsset } from "./library-asset.types";
import type { LibraryDocument } from "./library-document";

/** Reads a library picture's bytes; `null` when it can't (the caller has said so). */
export type ReadLibraryAsset = (
  library: LibraryDocument,
  asset: LibraryAsset,
) => Promise<Uint8Array | null>;

export interface MirrorOptions {
  /** The asset ids the file's layers show: the library pictures among them are copied in. */
  usedAssets?: ReadonlySet<string>;
  /** Libraries the file uses whose records stay as they are (their file can't be read now). */
  keep?: ReadonlySet<string>;
  /** Checked once the pictures are read: `true` writes nothing (the editor closed meanwhile). */
  cancelled?: () => boolean;
}
