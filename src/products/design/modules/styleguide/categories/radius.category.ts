import type { StyleguideCategory } from "../styleguide.types";
import { numbers } from "./category-tokens";

/** Number variables for corner radii. */
export const radiusCategory: StyleguideCategory = {
  id: "radius",
  label: "Radius",
  order: 50,
  defaultTemplate: "radius.corners",
  groups: (store) => numbers(store, "radius"),
};
