import { stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { stylesOf } from "../template-kit";
import { effectCard } from "./effect-cards";

/** The effect styles in one row in name order, like an elevation scale. */
export const elevationTemplate: StyleguideTemplate = {
  id: "effects.elevation",
  category: "effects",
  label: "Elevation ladder",
  description: "The styles in one row, in name order, like an elevation scale.",
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
