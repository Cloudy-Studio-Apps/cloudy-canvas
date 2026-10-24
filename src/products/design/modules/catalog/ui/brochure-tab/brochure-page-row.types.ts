import type { BlankReason, BrochurePage } from "@design";

export interface BrochurePageRowProps {
  page: BrochurePage;
  /** Its printed page numbers ("4", "6–7"). */
  label: string;
  /** Its position in the brochure (0-based). */
  position: number;
  selected: boolean;
  /** A page row was dropped on this one: the dragged page goes to `position`. */
  onDropPage(slotId: string, position: number): void;
}

export interface BrochureOptionsListProps {
  page: BrochurePage;
}

export interface PageThumbnailProps {
  frameId: string;
  className?: string;
}

export interface BlankPageRowProps {
  /** Its printed page number. */
  number: number;
  reason: BlankReason;
}
