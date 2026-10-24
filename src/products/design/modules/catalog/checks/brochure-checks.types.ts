import type { CanvasElement, Rect, Size } from "@canvas";

import type { BrochureSettings } from "../brochure";
import type { BookLayout, BrochurePage } from "../model";

export type BrochureIssueKind =
  "placeholder" | "low-resolution" | "text-in-margin" | "hidden-page" | "blank-page" | "odd-size";

/** Something that would print badly, on one page. */
export interface BrochureIssue {
  kind: BrochureIssueKind;
  /** The page's numbers ("4", "6–7"). */
  page: string;
  /** The page's frame. */
  frameId: string;
  /** The layer it's about (the frame itself for a hidden page). */
  nodeId: string;
  message: string;
}

/** What the checks read. */
export interface BrochureCheckInput {
  pages: readonly BrochurePage[];
  /** How they print (numbers, blanks added). */
  layout: BookLayout;
  /** Every element of the design (pages may be on any design page). */
  elements: readonly CanvasElement[];
  settings: BrochureSettings;
  /** Where an element shows (its turned box). */
  bounds: (el: CanvasElement) => Rect;
  /** A picture's natural size, or `null` while it isn't known. */
  imageSize: (assetId: string) => Size | null;
}
