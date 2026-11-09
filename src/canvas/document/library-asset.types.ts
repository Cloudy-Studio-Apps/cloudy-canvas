/** What a library asset is. */
export type LibraryAssetType = "image" | "svg" | "icon";

/** Which products can use an asset (components will be `design` or `board` only). */
export type LibraryAssetKind = "any" | "design" | "board";

/** A picture kept in a library. Its bytes are a file next to the library, not in the document. */
export interface LibraryAsset {
  id: string;
  name: string;
  /** A slash path of groups, e.g. `"Brand/Logo"`; `""` for none. */
  group: string;
  type: LibraryAssetType;
  kind: LibraryAssetKind;
  mime: string;
  /** File extension without the dot (`png`, `svg`). */
  ext: string;
  /** SHA-256 of the bytes (hex), to find the same picture again. */
  hash: string;
  width: number;
  height: number;
  /** Fractional index ordering it among the library's assets. */
  order: string;
}
