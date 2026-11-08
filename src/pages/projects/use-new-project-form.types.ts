export type StylesSourceKind = "empty" | "file" | "tokens";

/** Where the new project's styles start from, with the file picked for the last two. */
export type StylesSource =
  { kind: "empty" } | { kind: "file" | "tokens"; name: string; bytes: Uint8Array };
