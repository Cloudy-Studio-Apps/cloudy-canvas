import type { FontVariant } from "@shared/core";

import type { TypographyTarget } from "./typography-target.types";

export interface TypographyControlProps {
  target: TypographyTarget;
}

export interface FaceSelectProps extends TypographyControlProps {
  /** The faces the family has (or common ones when the library doesn't know it). */
  faces: readonly FontVariant[];
}
