import type { StyleguideTemplate } from "../../styleguide.types";
import { grid, stylesOf } from "../template-kit";
import { paintSwatch } from "./swatches.template";

/** A swatch per paint style with its name and summary. */
export const paintCardsTemplate: StyleguideTemplate = {
  id: "paint.cards",
  category: "paint-styles",
  label: "Cards",
  description: "A swatch per paint style with its name and what it's made of.",
  options: [{ id: "columns", label: "Columns", type: "number", default: 4, min: 1, max: 12 }],
  build: (group, options, context) => [
    grid(
      "grid",
      stylesOf(group).map((style) => paintSwatch(style, context, 160, true)),
      Number(options.columns),
    ),
  ],
};
