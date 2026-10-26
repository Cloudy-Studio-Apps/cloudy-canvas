import { PAINT_STYLE } from "../../core";
import { styleGroups } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";

/** Color (paint) styles. */
export const paintStylesCategory: StyleguideCategory = {
  id: "paint-styles",
  label: "Paint styles",
  order: 80,
  defaultTemplate: "paint.swatches",
  groups: (store) => styleGroups(store.styles(PAINT_STYLE)),
};
