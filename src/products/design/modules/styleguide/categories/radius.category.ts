import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";
import { t } from "../styleguide.i18n";

/** Number variables for corner radii. */
export const radiusCategory: StyleguideCategory = {
  id: "radius",
  label: t("categories.radius"),
  order: 50,
  defaultTemplate: "radius.corners",
  groups: (store) => numbers(store, "radius"),
};
