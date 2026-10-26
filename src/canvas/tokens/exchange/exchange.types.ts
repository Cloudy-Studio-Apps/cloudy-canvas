import type { TokenRecord } from "../token.types";

/** What to take from a set of token records: whole collections, groups of one, styles. */
export interface TokenPick {
  /** Collection ids: every variable in them. */
  collections: readonly string[];
  /** A group (slash path) of a collection: its variables and its subgroups'. */
  groups: readonly { collectionId: string; group: string }[];
  /** Style ids. */
  styles: readonly string[];
  /** Style types: every style of them. */
  styleTypes: readonly string[];
}

/** The picked records with everything they need to resolve. */
export interface SelectedTokens {
  records: TokenRecord[];
  /** Variables and styles added because the picked ones use them. */
  extra: number;
}

/** What an import does with a variable or style named like one the file has, with another id. */
export type ImportChoice = "keep-both" | "replace" | "skip";

/** An incoming variable or style named like one of the file's, with another id. */
export interface ImportConflict {
  incomingId: string;
  existingId: string;
  kind: "variable" | "style";
  /** `Collection/path` for a variable, the style's name for a style. */
  name: string;
}

/** The records an import writes, and what it did. */
export interface TokenImportPlan {
  records: TokenRecord[];
  /** Variables and styles new to the file. */
  added: number;
  /** Variables and styles the file had (by id, or by name when replacing). */
  updated: number;
  /** Variables and styles left as the file has them. */
  skipped: number;
}

/** Token records read from a file in another format, and what couldn't be brought over. */
export interface TokenReadResult {
  records: TokenRecord[];
  warnings: string[];
}
