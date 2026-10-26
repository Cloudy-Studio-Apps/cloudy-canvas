import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";

/** Number variables for opacity. */
export const opacityCategory: StyleguideCategory = {
  id: "opacity",
  label: "Opacity",
  order: 90,
  defaultTemplate: "opacity.checker",
  groups: (store) => numbers(store, "opacity"),
};
