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
  /** Whether the "Made with Cloudy Canvas" card is open; the logo toggles it. */
  madeWithOpen: boolean;
  onLogo(): void;
}

export interface TitlePopoverProps {
  meta: DocumentMeta;
}
