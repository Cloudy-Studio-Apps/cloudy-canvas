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

/** What planning a design page reads. */
export interface PlanInput {
  /** The page's open brochure, `null` when it has none (its copies then go). */
  record: BrochureElement | null;
  targets: readonly StampTarget[];
  /** The tokens' values but the page's own (`info`). */
  context: Omit<TemplateContext, "info">;
  /** The design page's layers, by id. */
  byId: ReadonlyMap<string, CanvasElement>;
  /** Parent id → its children's ids (`childrenByParent`). */
  children: ReadonlyMap<string, readonly string[]>;
}
