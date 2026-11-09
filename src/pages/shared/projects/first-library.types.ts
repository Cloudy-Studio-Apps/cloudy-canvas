/**
 * Where a library's records start from: nothing, the styles of a `.cdesign`/`.cboard` (its
 * bytes), or a tokens JSON (its bytes).
 */
export type FirstLibrarySource =
  "empty" | { fromFile: Uint8Array } | { fromTokensJson: Uint8Array };

export type StylesSourceKind = "empty" | "file" | "tokens";

/** A file picked as the styles' source: a design or board, or a tokens JSON. */
export interface PickedStyles {
  kind: "file" | "tokens";
  name: string;
  bytes: Uint8Array;
}

/** Where the styles start from, with the file picked for the last two. */
export type StylesSource = { kind: "empty" } | PickedStyles;

/** The texts `pickStylesSource` shows in its file dialog. */
export interface PickStylesLabels {
  pickFile: string;
  pickTokens: string;
  filterDesignBoard: string;
  filterJson: string;
}
