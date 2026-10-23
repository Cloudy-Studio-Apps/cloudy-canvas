export interface SourceLanguageSpec {
  name: string;
  /** Words that start a definition (lowercase), e.g. `table`; the word after one is its name. */
  blockKeywords: readonly string[];
  /** Words colored as settings inside `[...]` (lowercase), e.g. `pk`. */
  settings: readonly string[];
  /** Inside a block, the second word on a line is a type (DBML columns: `id integer`). */
  typeAfterName?: boolean;
  /**
   * Block keywords that still start a line inside a block (ER: `attr`), so a name like `entity`
   * there isn't colored as one. Every block keyword when unset (DBML: `indexes`, `note`).
   */
  nestedKeywords?: readonly string[];
  /** A block keyword right after another is a keyword too (`Ref` … `as`); default true. */
  chainKeywords?: boolean;
  /** `name.part` colors the part as a type (ER: `Cliente.id`, the join attribute). */
  dottedParts?: boolean;
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
  /** The previous token was the `.` after a name, so this word is its part. */
  afterDot: boolean;
}
