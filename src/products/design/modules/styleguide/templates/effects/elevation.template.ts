import { stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { stylesOf } from "../template-kit";
import { effectCard } from "./effect-cards";
import { t } from "../../styleguide.i18n";

/** The effect styles in one row in name order, like an elevation scale. */
export const elevationTemplate: StyleguideTemplate = {
  id: "effects.elevation",
  category: "effects",
  label: t("templates.effects.elevation.label"),
  description: t("templates.effects.elevation.description"),
  options: [],
  build: (group, _options, context) => [
    stack(
      "ladder",
      "horizontal",
      [...stylesOf(group)]
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map((style) => effectCard(style, context, 100)),
      { gap: 48 },
    ),
  ],
};
