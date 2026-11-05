import type { ElementPatch, Point } from "@canvas";

import type { DesignNode } from "../../../core";
import type { FrameElement } from "../../../frame";
import type { RepeatCopyTag } from "./repeat-copy-tag.types";

/** What one generated page is planned from. */
export interface PageCopyInput {
  /** The template slot's printed frame. */
  template: FrameElement;
  /** The template frame's layers (it and everything it holds). */
  tree: readonly DesignNode[];
  /** The generated page's frame already there, `null` to make one. */
  copy: DesignNode | null;
  /** What the generated page's frame holds now. */
  existing: readonly DesignNode[];
  /** The tag of its layers but the `source` (each layer's template layer). */
  tag: Omit<RepeatCopyTag, "source">;
  /** Where a new page's frame goes (its top-left). */
  at: Point;
}

/** What keeps one generated page in step with its template page. Pure data: nothing is written. */
export interface PageCopyPlan {
  /** The page's frame: the one there, or the new one in `add`. */
  rootId: string;
  /** New layers, parents before their children; a new page's frame first, with no index yet. */
  add: DesignNode[];
  patch: Map<string, ElementPatch>;
  /** Layers whose template layer went, with what they hold. */
  remove: string[];
}
