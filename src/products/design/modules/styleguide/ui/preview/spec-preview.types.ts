import type { GeneratedSpec } from "../../styleguide.types";

export interface SpecPreviewProps {
  specs: readonly GeneratedSpec[];
  /** The picture's height in CSS pixels; it's as wide as where it's placed. */
  height: number;
}

export interface SpecNodeProps {
  spec: GeneratedSpec;
}
