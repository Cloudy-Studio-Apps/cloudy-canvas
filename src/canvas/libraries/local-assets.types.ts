import type { LibraryAsset } from "../document";

/** What `moveAssetToLibrary` needs of the project's libraries (the editor's `LibraryHub`). */
export interface AssetLibraryWriter {
  /** Adds a picture to a library (one it has already, by hash, is returned as it is). */
  addAssetFile(
    libraryId: string,
    bytes: Uint8Array,
    input: Omit<LibraryAsset, "id" | "hash" | "kind" | "order">,
  ): Promise<LibraryAsset>;
}
