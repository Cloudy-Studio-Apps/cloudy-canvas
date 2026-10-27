import type { StyleguideTemplate } from "../../styleguide.types";
import { grid, stylesOf } from "../template-kit";
import { effectCard } from "./effect-cards";
import { t } from "../../styleguide.i18n";

/** A card per effect style, in a grid. */
export const effectCardsTemplate: StyleguideTemplate = {
  id: "effects.cards",
  category: "effects",
  label: t("templates.effects.cards.label"),
  description: t("templates.effects.cards.description"),
  options: [
    {
      id: "columns",
      label: t("templates.effects.cards.columns"),
      type: "number",
      default: 4,
      min: 1,
      max: 8,
    },
    {
      id: "size",
      label: t("templates.effects.cards.cardHeight"),
      type: "number",
      default: 120,
      min: 60,
      max: 240,
      step: 10,
    },
  ],
  build: (group, options, context) => [
    grid(
      "grid",
      stylesOf(group).map((style) => effectCard(style, context, Number(options.size))),
      Number(options.columns),
      48,
    ),
  ],
};
