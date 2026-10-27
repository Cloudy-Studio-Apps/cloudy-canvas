import type { StyleguideTemplate } from "../../styleguide.types";
import { grid, stylesOf } from "../template-kit";
import { paintSwatch } from "./swatches.template";
import { t } from "../../styleguide.i18n";

/** A swatch per paint style with its name and summary. */
export const paintCardsTemplate: StyleguideTemplate = {
  id: "paint.cards",
  category: "paint-styles",
  label: t("templates.paint.cards.label"),
  description: t("templates.paint.cards.description"),
  options: [
    {
      id: "columns",
      label: t("templates.paint.cards.columns"),
      type: "number",
      default: 4,
      min: 1,
      max: 12,
    },
  ],
  build: (group, options, context) => [
    grid(
      "grid",
      stylesOf(group).map((style) => paintSwatch(style, context, 160, true)),
      Number(options.columns),
    ),
  ],
};
