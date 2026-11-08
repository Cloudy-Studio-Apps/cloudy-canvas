import type {
  CollectionRecord,
  ModeAxisRecord,
  StyleRecord,
  TokenRecord,
  VariableRecord,
} from "../tokens/token.types";

/** What moving a file's own records to a library would move (`planLibraryMove`). */
export interface LibraryMovePlan {
  /** Every record that moves, as the file stores it now (without a tag). */
  records: TokenRecord[];
  /** The collections that move: a variable takes its whole collection. */
  collections: CollectionRecord[];
  /** How many variables move (the collections' variables). */
  variables: number;
  styles: StyleRecord[];
  /**
   * What the moving records read that would stay behind: the file's own variables (or another
   * library's variables or axes). While there are any, the move is refused, since the library
   * would point at a file.
   */
  blockers: (VariableRecord | ModeAxisRecord)[];
}
