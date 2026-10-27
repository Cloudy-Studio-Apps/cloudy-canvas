import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";
import { t } from "../styleguide.i18n";

/** Number variables for opacity. */
export const opacityCategory: StyleguideCategory = {
  id: "opacity",
  label: t("categories.opacity"),
  order: 90,
  defaultTemplate: "opacity.checker",
  groups: (store) => numbers(store, "opacity"),
};
