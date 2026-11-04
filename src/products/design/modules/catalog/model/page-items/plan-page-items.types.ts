import type { CanvasElement, ElementPatch } from "@canvas";

import type { BrochureElement } from "../../brochure";
import type { StampTarget } from "./stamp-targets.types";
import type { TemplateContext } from "./page-item.types";

/** What a design page's master copies and page items need written. */
export interface PageItemPlan {
  add: CanvasElement[];
  update: Map<string, ElementPatch>;
  remove: string[];
}

/** One brochure of a design page, as planning it reads. */
export interface PlanBrochure {
  record: BrochureElement;
  targets: readonly StampTarget[];
  /** The tokens' values but the page's own (`info`). */
  context: Omit<TemplateContext, "info">;
}

/** What planning a design page reads. */
export interface PlanInput {
  /**
   * The page's brochures, the open one last: each stamps its own frames, and a frame two of
   * them use gets the last one's copies. None: every copy on the page goes.
   */
  brochures: readonly PlanBrochure[];
  /** The design page's layers, by id. */
  byId: ReadonlyMap<string, CanvasElement>;
  /** Parent id → its children's ids (`childrenByParent`). */
  children: ReadonlyMap<string, readonly string[]>;
}
