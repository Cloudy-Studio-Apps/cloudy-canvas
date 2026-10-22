export interface SourceLanguageSpec {
  name: string;
  /** Words that start a definition (lowercase), e.g. `table`; the word after one is its name. */
  blockKeywords: readonly string[];
  /** Words colored as settings inside `[...]` (lowercase), e.g. `pk`. */
  settings: readonly string[];
  /** Inside a block, the second word on a line is a type (DBML columns: `id integer`). */
  typeAfterName?: boolean;
}

export interface SourceLanguageState {
  /** Inside a block comment or a triple-quoted string that continues on the next line. */
  open: "comment" | "string" | null;
  /** `{` depth. */
  depth: number;
  /** Inside `[...]` settings. */
  inSettings: boolean;
  /** Words seen on the current line, outside settings. */
  words: number;
  /** The previous word was a block keyword, so the next one is the defined name. */
  afterKeyword: boolean;
}
