import { label, SHEET_LOOK } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { t } from "../../styleguide.i18n";

/** The file's title only. */
export const coverMinimalTemplate: StyleguideTemplate = {
  id: "cover.minimal",
  category: "cover",
  label: t("templates.cover.minimal.label"),
  description: t("templates.cover.minimal.description"),
  options: [
    {
      id: "font",
      label: t("templates.cover.minimal.font"),
      type: "font",
      default: SHEET_LOOK.font,
    },
  ],
  build: (_group, options, context) => [
    label("title", context.meta.title || t("defaults.systemPage"), {
      size: 48,
      weight: "700",
      font: String(options.font),
    }),
  ],
};
