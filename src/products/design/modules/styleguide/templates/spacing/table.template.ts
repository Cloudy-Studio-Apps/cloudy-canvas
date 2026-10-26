import type { StyleguideTemplate } from "../../styleguide.types";
import { numberTable } from "../number-table";

/** The spacing values as a table. */
export const spacingTableTemplate: StyleguideTemplate = {
  id: "spacing.table",
  category: "spacing",
  label: "Table",
  description: "Every value in a table.",
  options: [],
  build: (group, _options, context) => numberTable(group, context),
};
