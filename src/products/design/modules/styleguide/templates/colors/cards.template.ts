import { stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { grid, variablesOf, withDefaults } from "../template-kit";
import { COLOR_OPTIONS, COLUMNS_OPTION, colorCaption, colorSwatch, swatchSize } from "./color-kit";
import { t } from "../../styleguide.i18n";

/** Cards: a wide swatch over the name and every value asked for, on a white card. */
export const cardsTemplate: StyleguideTemplate = {
  id: "colors.cards",
  category: "colors",
  label: t("templates.colors.cards.label"),
  description: t("templates.colors.cards.description"),
  options: withDefaults([...COLOR_OPTIONS, COLUMNS_OPTION], {
    showRgb: true,
    showCode: true,
    showDescription: true,
    columns: 4,
  }),
  build: (group, options, context) => {
    const width = swatchSize(options) * 2;
    const cells = variablesOf(group).map((variable) =>
      stack(
        `item:${variable.id}`,
        "vertical",
        [
          colorSwatch("swatch", variable, context, width, swatchSize(options)),
          stack("caption", "vertical", colorCaption(variable, options, context, width - 24), {
            gap: 4,
            padding: 12,
          }),
        ],
        {
          gap: 0,
          fills: [{ type: "solid", color: "#FFFFFF", opacity: 1 }],
          strokes: [{ type: "solid", color: "#E5E7EB", opacity: 1 }],
          strokeWeight: 1,
          cornerRadius: 8,
          clipsContent: true,
        },
      ),
    );
    return [grid("grid", cells, Number(options.columns))];
  },
};
