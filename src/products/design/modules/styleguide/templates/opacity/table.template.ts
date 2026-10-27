import type { StyleguideTemplate } from "../../styleguide.types";
import { numberTable } from "../number-table";
import { t } from "../../styleguide.i18n";

/** The opacities as a table. */
export const opacityTableTemplate: StyleguideTemplate = {
  id: "opacity.table",
  category: "opacity",
  label: t("templates.opacity.table.label"),
  description: t("templates.opacity.table.description"),
  options: [],
  build: (group, _options, context) => numberTable(group, context),
};
