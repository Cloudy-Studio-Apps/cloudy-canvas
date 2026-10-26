import type { StyleguideTemplate } from "../../styleguide.types";
import { numberTable } from "../number-table";

/** The opacities as a table. */
export const opacityTableTemplate: StyleguideTemplate = {
  id: "opacity.table",
  category: "opacity",
  label: "Table",
  description: "Every opacity in a table.",
  options: [],
  build: (group, _options, context) => numberTable(group, context),
};
