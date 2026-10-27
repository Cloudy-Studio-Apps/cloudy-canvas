import { label, SHEET_LOOK, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { t } from "../../styleguide.i18n";

/** The file's title, its description and the date. */
export const coverTitleTemplate: StyleguideTemplate = {
  id: "cover.title",
  category: "cover",
  label: t("templates.cover.title.label"),
  description: t("templates.cover.title.description"),
  options: [
    { id: "font", label: t("templates.cover.title.font"), type: "font", default: SHEET_LOOK.font },
  ],
  build: (_group, options, context) => [
    stack(
      "cover",
      "vertical",
      [
        label("title", context.meta.title || t("defaults.systemPage"), {
          size: 64,
          weight: "700",
          font: String(options.font),
        }),
        ...(context.meta.description
          ? [
              label("description", context.meta.description, {
                size: 18,
                color: SHEET_LOOK.muted,
                width: 720,
                font: String(options.font),
              }),
            ]
          : []),
        label("date", context.today, { color: SHEET_LOOK.muted, font: String(options.font) }),
      ],
      { gap: 16, padding: [64, 0] },
    ),
  ],
};
