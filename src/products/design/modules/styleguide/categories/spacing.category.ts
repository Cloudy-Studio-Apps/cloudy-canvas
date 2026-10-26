import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";

/** Number variables for gaps and padding. */
export const spacingCategory: StyleguideCategory = {
  id: "spacing",
  label: "Spacing",
  order: 40,
  defaultTemplate: "spacing.bars",
  groups: (store) => numbers(store, "spacing"),
};
