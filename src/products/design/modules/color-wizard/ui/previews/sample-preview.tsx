import { BrochurePreview } from "./brochure-preview";
import { ComponentsPreview } from "./components-preview";
import { MobilePreview } from "./mobile-preview";
import type { SamplePreviewProps } from "./preview.types";
import { SocialPreview } from "./social-preview";
import { usePreviewTokens } from "./use-preview-tokens";
import { WebsitePreview } from "./website-preview";

const PREVIEWS = {
  website: WebsitePreview,
  components: ComponentsPreview,
  social: SocialPreview,
  brochure: BrochurePreview,
  mobile: MobilePreview,
} as const;

/** One sample design drawn with the Theme in one mode. */
export function SamplePreview({ kind, mode }: SamplePreviewProps) {
  const tokens = usePreviewTokens(mode);
  const Preview = PREVIEWS[kind];
  return <Preview p={tokens} />;
}
