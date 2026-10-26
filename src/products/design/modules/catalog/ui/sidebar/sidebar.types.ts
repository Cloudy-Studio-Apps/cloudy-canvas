import type { BrochurePage } from "../../model/brochure-pages.types";
import type { FrameElement } from "../../../frame";
import type { PagePicture } from "../../model/page-pictures.types";

export interface PageSectionProps {
  page: BrochurePage;
}

export interface PageImagesSectionProps {
  frame: FrameElement;
}

export interface PageImageRowProps {
  picture: PagePicture;
}

export interface LooseFrameSectionProps {
  frame: FrameElement;
}

export interface FramesSectionProps {
  frames: readonly FrameElement[];
}
