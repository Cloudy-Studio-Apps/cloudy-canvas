import type { DesignNode } from "../../core";
import type { DataCopyTag } from "./repeat.types";

/** New layers of one row's copy: a whole copy, or the parts the template gained since. */
export interface DataCopyAdd {
  key: string;
  /** The row's position in the shown list. */
  index: number;
  /** Fresh ids, tagged and locked, parents before their children. */
  nodes: DesignNode[];
}

/** What keeps an iterator's copies in step with its template and rows. Pure data: nothing is written. */
export interface DataCopyPlan {
  add: DataCopyAdd[];
  /** Copies' layers whose template part changed (data-resolved fields never in it). */
  patch: { id: string; patch: Partial<DesignNode> }[];
  /** Layers to remove: copies whose key is gone or repeated, with what they hold, and parts the template lost. */
  remove: string[];
  /** Copies kept that move so the copies follow row order after the template. */
  order: { id: string; index: string }[];
}

/** Where a copy's layer goes and what it's told apart by. */
export interface CopyPlace {
  parentId: string;
  pageId: string;
  tag: DataCopyTag;
  /** Its position, `null` to keep the copy's own (auto layout or its data places it). */
  x: number | null;
  y: number | null;
  /** Its sibling order, `null` to keep the copy's own (a copy's root, ordered by row). */
  index: string | null;
}
