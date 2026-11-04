import type { BrochurePage } from "../../model/brochure-pages.types";
import type { FrameElement } from "../../../frame";
import type { BrochureMaster } from "../../brochure/brochure.types";

/** What's selected in the Catalog mode. */
export type CatalogSelection =
  | { kind: "none" }
  /** A frame printed on a page, or one of its options. */
  | { kind: "page"; page: BrochurePage; frame: FrameElement }
  /** A frame of one of the brochure's masters: the side it's for. */
  | { kind: "master"; master: BrochureMaster; side: "left" | "right"; frame: FrameElement }
  /** A frame that isn't in the brochure. */
  | { kind: "loose"; frame: FrameElement }
  /** Several frames. */
  | { kind: "several"; frames: FrameElement[] };
