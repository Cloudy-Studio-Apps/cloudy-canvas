import type { StyleguideTemplate } from "../../styleguide.types";
import { grid, stylesOf } from "../template-kit";
import { effectCard } from "./effect-cards";

/** A card per effect style, in a grid. */
export const effectCardsTemplate: StyleguideTemplate = {
  id: "effects.cards",
  category: "effects",
  label: "Cards with the effect",
  description: "A white card per effect style, with its name and summary.",
  options: [
    { id: "columns", label: "Columns", type: "number", default: 4, min: 1, max: 8 },
    { id: "size", label: "Card height", type: "number", default: 120, min: 60, max: 240, step: 10 },
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
