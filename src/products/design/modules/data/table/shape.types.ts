/**
 * An optional step between finding a source's rows (`rowsPath`) and guessing their fields: it
 * renames fields and keeps only some. A source without one reads its rows as they are.
 */
export interface DataShape {
  /** New paths by a field's path in the rows as read (`attributes.title` → `name`). */
  rename: Record<string, string>;
  /** Only these fields, by their path after renaming (a group keeps what's in it); unset, all. */
  include?: string[];
}
