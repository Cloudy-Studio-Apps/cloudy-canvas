/** Where the cursor is in DBML-like text, for completions. */
export interface SourceContext {
  /** The line up to the cursor. */
  before: string;
  /** Start of the word being typed. */
  from: number;
  /** The word being typed so far (may be empty). */
  typed: string;
  /** Keywords (lowercase first words) of the `{ }` blocks the cursor is in, innermost last. */
  blocks: string[];
  /** Inside `[...]` settings. */
  inSettings: boolean;
  /** The settings typed so far, from `[` up to the cursor. */
  settings: string;
  /** Words before the one being typed, on this line and after its last `{`, settings left out. */
  wordsBefore: string[];
}
