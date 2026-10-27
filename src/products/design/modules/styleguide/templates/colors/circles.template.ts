import { dot, solidFill, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { colorOf, grid, leafName, variablesOf, withDefaults } from "../template-kit";
import { COLOR_OPTIONS, COLUMNS_OPTION, colorCaption, swatchSize } from "./color-kit";
import { t } from "../../styleguide.i18n";

/** Circles with their names under them. */
export const circlesTemplate: StyleguideTemplate = {
  id: "colors.circles",
  category: "colors",
  label: t("templates.colors.circles.label"),
  description: t("templates.colors.circles.description"),
  options: withDefaults([...COLOR_OPTIONS, COLUMNS_OPTION], { swatch: 72, columns: 8 }),
  build: (group, options, context) => {
    const size = swatchSize(options);
    const cells = variablesOf(group).map((variable) =>
      stack(
        `item:${variable.id}`,
        "vertical",
        [
          dot(
            "swatch",
            size,
            { name: leafName(variable), ...solidFill(colorOf(context, variable.id)) },
            { "fills.0.color": variable.id },
          ),
          ...colorCaption(variable, options, context, Math.max(size, 72)),
        ],
        { gap: 8, counterAlign: "center" },
      ),
    );
    return [grid("grid", cells, Number(options.columns))];
  },
};
