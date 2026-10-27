import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";
import { t } from "../styleguide.i18n";

/** Number variables for gaps and padding. */
export const spacingCategory: StyleguideCategory = {
  id: "spacing",
  label: t("categories.spacing"),
  order: 40,
  defaultTemplate: "spacing.bars",
  groups: (store) => numbers(store, "spacing"),
};
