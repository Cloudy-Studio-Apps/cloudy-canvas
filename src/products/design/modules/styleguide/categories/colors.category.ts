import type { StyleguideCategory } from "../styleguide.types";
import { variables } from "./category-tokens";

/** Color variables, by collection and group. */
export const colorsCategory: StyleguideCategory = {
  id: "colors",
  label: "Colors",
  order: 20,
  defaultTemplate: "colors.swatch-grid",
  groups: (store) => variables(store, (v) => v.type === "color"),
};
