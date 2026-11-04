import type { BrochureMaster } from "../../brochure";
import type { FrameElement } from "../../../frame";
import type { PageInfo } from "../numbering/page-numbers.types";

/** A page (or half a spread frame) and what's stamped on it. */
export interface StampTarget {
  /** The page frame: the printed one or another option of its page. */
  frame: FrameElement;
  /** Where the page starts in the frame: 0, or half its width for a spread's right page. */
  offsetX: number;
  /** The half of a spread frame it is, left out for a frame that's one page. */
  half?: "left" | "right";
  info: PageInfo;
  /** The master it shows and its frame for this side, `null` for none. */
  master: { record: BrochureMaster; frame: FrameElement } | null;
  /** The master layers detached on this page. */
  skip: ReadonlySet<string>;
}
