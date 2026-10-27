import type { StyleguideCategory } from "../styleguide.types";
import { variables } from "./category-tokens";
import { t } from "../styleguide.i18n";

/** Color variables, by collection and group. */
export const colorsCategory: StyleguideCategory = {
  id: "colors",
  label: t("categories.colors"),
  order: 20,
  defaultTemplate: "colors.swatch-grid",
  groups: (store) => variables(store, (v) => v.type === "color"),
};
