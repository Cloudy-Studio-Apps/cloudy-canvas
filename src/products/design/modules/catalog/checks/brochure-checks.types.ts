import type { CanvasElement, Rect, Size } from "@canvas";

import type { BrochureSettings } from "../brochure";
import type { BrochurePage } from "../model";

export type BrochureIssueKind = "low-resolution" | "text-in-margin" | "hidden-page";

/** Something that would print badly, on one page. */
export interface BrochureIssue {
  kind: BrochureIssueKind;
  page: number;
  /** The page's frame. */
  frameId: string;
  /** The layer it's about (the frame itself for a hidden page). */
  nodeId: string;
  message: string;
}

/** What the checks read. */
export interface BrochureCheckInput {
  pages: readonly BrochurePage[];
  /** Every element of the design (pages may be on any design page). */
  elements: readonly CanvasElement[];
  settings: BrochureSettings;
  /** Where an element shows (its turned box). */
  bounds: (el: CanvasElement) => Rect;
  /** A picture's natural size, or `null` while it isn't known. */
  imageSize: (assetId: string) => Size | null;
}
