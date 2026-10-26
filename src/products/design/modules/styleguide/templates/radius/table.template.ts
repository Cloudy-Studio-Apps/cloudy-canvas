import type { StyleguideTemplate } from "../../styleguide.types";
import { numberTable } from "../number-table";

/** The radii as a table. */
export const radiusTableTemplate: StyleguideTemplate = {
  id: "radius.table",
  category: "radius",
  label: "Table",
  description: "Every radius in a table.",
  options: [],
  build: (group, _options, context) => numberTable(group, context),
};
