import type { FileInfo } from "@core";
import type { BoardDocument } from "@engine";

export type BoardLoadState =
  | { status: "loading" }
  /** `info` is `null` for a new board that hasn't been saved yet. */
  | { status: "ready"; document: BoardDocument; info: FileInfo | null }
  | { status: "error"; message: string };
