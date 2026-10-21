import type { FileInfo } from "@shared/core";
import type { CanvasDocument } from "@canvas";

export type BoardLoadState =
  | { status: "loading" }
  /** `info` is `null` for a new board that hasn't been saved yet. */
  | { status: "ready"; document: CanvasDocument; info: FileInfo | null }
  | { status: "error"; message: string };
