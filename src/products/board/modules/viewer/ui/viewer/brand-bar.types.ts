import type { DocumentMeta } from "@canvas";
import type { ViewerPartButton } from "../viewer-part.types";

/** One part's toggle in the brand bar. */
export interface BrandBarToggle {
  id: string;
  button: ViewerPartButton;
  active: boolean;
  onToggle(): void;
}

export interface BrandBarProps {
  meta: DocumentMeta;
  toggles: readonly BrandBarToggle[];
}

export interface TitlePopoverProps {
  meta: DocumentMeta;
}
