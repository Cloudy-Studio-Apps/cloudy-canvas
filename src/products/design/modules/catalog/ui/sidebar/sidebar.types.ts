import type { BrochureSection } from "../../brochure/brochure.types";
import type { BrochurePage } from "../../model/brochure-pages.types";
import type { FrameElement } from "../../../frame";
import type { PagePicture } from "../../model/page-pictures.types";
import type { BrochureMaster } from "../../brochure/brochure.types";

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

export interface PageMasterFieldProps {
  /** The pages it sets (slot ids). */
  slotIds: readonly string[];
}

export interface SectionFieldsProps {
  page: BrochurePage;
}

export interface SectionCardProps {
  section: BrochureSection;
  /** The level it reads at (0 the top). */
  depth: number;
  /** Its first page's place among the layout's sides. */
  side: number;
}

export interface MasterSideSectionProps {
  master: BrochureMaster;
  side: "left" | "right";
}

export interface PageItemsSectionProps {
  /** The page or master frame selected, which a click adds the items to. */
  frame: FrameElement;
}
