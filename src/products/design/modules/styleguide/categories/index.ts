import { coverCategory } from "./cover.category";
import { colorsCategory } from "./colors.category";
import { typographyCategory } from "./typography.category";
import { spacingCategory } from "./spacing.category";
import { radiusCategory } from "./radius.category";
import { effectsCategory } from "./effects.category";
import { strokesCategory } from "./strokes.category";
import { paintStylesCategory } from "./paint-styles.category";
import { opacityCategory } from "./opacity.category";
import { otherCategory } from "./other.category";
import type { StyleguideCategory } from "../styleguide.types";

/** The built-in categories, in the view's default order. */
export const BUILT_IN_CATEGORIES: readonly StyleguideCategory[] = [
  coverCategory,
  colorsCategory,
  typographyCategory,
  spacingCategory,
  radiusCategory,
  effectsCategory,
  strokesCategory,
  paintStylesCategory,
  opacityCategory,
  otherCategory,
];
