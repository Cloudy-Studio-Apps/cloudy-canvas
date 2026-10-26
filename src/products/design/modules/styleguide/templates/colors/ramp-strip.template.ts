import { stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { variablesOf } from "../template-kit";
import { COLOR_OPTIONS, colorCaption, colorSwatch, swatchSize } from "./color-kit";

/** A ramp's shades joined in one strip, each with its name and value under it. */
export const rampStripTemplate: StyleguideTemplate = {
  id: "colors.ramp-strip",
  category: "colors",
  label: "Ramp strip",
  description: "Shades joined in one strip, with their names and values under them.",
  options: COLOR_OPTIONS,
  build: (group, options, context) => {
    const size = swatchSize(options);
    const variables = variablesOf(group);
    return [
      stack(
        "strip",
        "horizontal",
        variables.map((variable) =>
          stack(
            `item:${variable.id}`,
            "vertical",
            [
              colorSwatch("swatch", variable, context, size, size * 1.25),
              ...colorCaption(variable, options, context, size - 8),
            ],
            { gap: 8 },
          ),
        ),
        { gap: 0 },
      ),
    ];
  },
};
