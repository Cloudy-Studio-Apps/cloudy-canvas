import type { StyleguideTemplate } from "../../styleguide.types";
import { numberTable } from "../number-table";
import { t } from "../../styleguide.i18n";

/** The spacing values as a table. */
export const spacingTableTemplate: StyleguideTemplate = {
  id: "spacing.table",
  category: "spacing",
  label: t("templates.spacing.table.label"),
  description: t("templates.spacing.table.description"),
  options: [],
  build: (group, _options, context) => numberTable(group, context),
};
