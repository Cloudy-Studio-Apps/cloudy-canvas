import type { ExportHost } from "../../export";

/** What a workspace's exports take from outside its scene. */
export interface SceneExportOptions {
  /** The ids exported when an area asks for the selection without `ids`. */
  selected(): Iterable<string>;
  background: number;
  snapshot: ExportHost["snapshot"];
}
