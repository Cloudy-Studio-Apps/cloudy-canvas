/** What a library edit changed: the ids of the token records and assets written or removed. */
export interface LibraryChange {
  tokens: ReadonlySet<string>;
  assets: ReadonlySet<string>;
}
