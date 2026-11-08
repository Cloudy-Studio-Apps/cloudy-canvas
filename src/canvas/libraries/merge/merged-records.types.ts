import type { TokenRecord } from "../../tokens/token.types";

/** What a merge writes to the library, and how the file's records map onto the library's. */
export interface MergedRecords {
  /** Records for the library (untagged): the file's added ones, axes that gained modes. */
  puts: TokenRecord[];
  /** A file record's id → the library's record it becomes (itself when it's added as it is). */
  idOf: (id: string) => string;
  /** A file mode's id → the library's mode it becomes. */
  modeOf: (id: string) => string;
  /** The file's records that leave it: merged into the library's, replaced or dropped. */
  leaving: string[];
}
