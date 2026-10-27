import type { StyleguideTemplate } from "../../styleguide.types";
import { numberTable } from "../number-table";
import { t } from "../../styleguide.i18n";

/** The radii as a table. */
export const radiusTableTemplate: StyleguideTemplate = {
  id: "radius.table",
  category: "radius",
  label: t("templates.radius.table.label"),
  description: t("templates.radius.table.description"),
  options: [],
  build: (group, _options, context) => numberTable(group, context),
};
