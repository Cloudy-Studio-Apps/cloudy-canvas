import { PAINT_STYLE } from "../../core";
import { styleGroups } from "../sheet";
import type { StyleguideCategory } from "../styleguide.types";
import { t } from "../styleguide.i18n";

/** Color (paint) styles. */
export const paintStylesCategory: StyleguideCategory = {
  id: "paint-styles",
  label: t("categories.paintStyles"),
  order: 80,
  defaultTemplate: "paint.swatches",
  groups: (store) => styleGroups(store.styles(PAINT_STYLE)),
};
