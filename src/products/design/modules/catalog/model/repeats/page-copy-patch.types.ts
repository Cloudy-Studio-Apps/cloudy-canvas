import type { RepeatCopyTag } from "./repeat-copy-tag.types";

/** Where a generated page's layer goes and what it's told apart by. */
export interface PageCopyPlace {
  /** Its parent's copy, `null` for the page's own frame. */
  parentId: string | null;
  pageId: string;
  tag: RepeatCopyTag;
  /** Its position, `null` to keep the copy's own (the page's frame, or what data or a layout places). */
  x: number | null;
  y: number | null;
  /** Its sibling order, `null` to keep the copy's own (the page's frame). */
  index: string | null;
}
