/** Where an incoming variable or style goes in the file. */
export type ImportMatch =
  /** The file has it: same id. */
  | { kind: "same-id" }
  /** The file has one named like it, with another id. */
  | { kind: "conflict"; existingId: string }
  | { kind: "new" };

/** How incoming records line up with the file's: ids mapped, and each token's match. */
export interface ImportMatches {
  /** Incoming axis and collection ids → the file's (themselves when new). */
  ids: Map<string, string>;
  /** Incoming mode ids → the file's. */
  modes: Map<string, string>;
  /** By incoming variable or style id. */
  tokens: Map<string, ImportMatch>;
}
