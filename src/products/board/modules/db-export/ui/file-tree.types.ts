/** A row of the file list: a folder or a file, indented by `depth`. */
export interface FileTreeRow {
  kind: "folder" | "file";
  /** Its last path segment. */
  name: string;
  /** The whole path (a folder's ends without `/`). */
  path: string;
  depth: number;
}
