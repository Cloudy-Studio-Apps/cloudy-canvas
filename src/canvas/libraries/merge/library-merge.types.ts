import type { ModeDef, TokenRecord } from "../../tokens/token.types";

/** What to do with a file's variable or style named like one of the library's, of the same type. */
export type ClashChoice = "project" | "both";

/** A file's variable or style with the name and type of one of the library's. */
export interface Clash {
  /** The file's record. */
  fileId: string;
  /** The library's record of that name (its id, not the library's). */
  libraryId: string;
  /** Its name: a variable's path, a style's name. */
  name: string;
  kind: "variable" | "style";
  /** `project` (the default): the file's layers use the library's; `both`: the file's is added too. */
  choice: ClashChoice;
  /** The name the file's gets with `both`: `"<name> (<file name>)"`, free in the library. */
  bothName: string;
}

/** A picture of the file, as the merge compares it: by its bytes' hash. */
export interface MergeFileAsset {
  id: string;
  hash: string;
  name: string;
}

/**
 * How a file's own variables, styles and pictures go into a project library
 * (`planLibraryMerge`); `applyLibraryMerge` carries it out with the clashes' choices.
 */
export interface MergePlan {
  /**
   * The file's records the library gets, as the file has them (untagged): new axes, collections,
   * variables, styles, generators and scales. Clashing ones aren't here.
   */
  added: TokenRecord[];
  clashes: Clash[];
  /**
   * The file's variables and styles named like one of the library's of another type (or like
   * another of the file's going to the same place): both are kept, the file's renamed.
   */
  renamedByType: { id: string; newName: string }[];
  /** A file axis → the library's axis of the same name. */
  axisMap: Record<string, string>;
  /** A mode of a merged file axis → the library axis's mode of the same name. */
  modeMap: Record<string, string>;
  /** A file collection → the library's collection of the same name. */
  collectionMap: Record<string, string>;
  /** Library axes that get the file's modes they lack (axis id → those modes, ids kept). */
  newModes: Record<string, ModeDef[]>;
  /**
   * Generators and scales the library doesn't get, since what they make or follow clashes or was
   * renamed: their variables keep their values, unlinked from them.
   */
  droppedGenerators: string[];
  /** A file picture → the library's picture with the same bytes. */
  assetMap: Record<string, string>;
}
