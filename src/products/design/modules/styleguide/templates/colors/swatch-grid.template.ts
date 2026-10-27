import { stack } from "../../sheet";
import type {
  GeneratedSpec,
  SheetBuildContext,
  SheetGroup,
  StyleguideTemplate,
  TemplateOptions,
} from "../../styleguide.types";
import { grid, variablesOf } from "../template-kit";
import { COLOR_OPTIONS, COLUMNS_OPTION, colorCaption, colorSwatch, swatchSize } from "./color-kit";
import { t } from "../../styleguide.i18n";

/** The swatch grid's body: rows of squares with their names and values. */
export function swatchGrid(
  group: SheetGroup,
  options: TemplateOptions,
  context: SheetBuildContext,
): GeneratedSpec[] {
  const size = swatchSize(options);
  const cells = variablesOf(group).map((variable) =>
    stack(
      `item:${variable.id}`,
      "vertical",
      [
        colorSwatch("swatch", variable, context, size, size, { cornerRadius: 6 }),
        ...colorCaption(variable, options, context, size),
      ],
      { gap: 8 },
    ),
  );
  return [grid("grid", cells, Number(options.columns))];
}

/** Squares in a grid, each with its name and hex code. */
export const swatchGridTemplate: StyleguideTemplate = {
  id: "colors.swatch-grid",
  category: "colors",
  label: t("templates.colors.swatchGrid.label"),
  description: t("templates.colors.swatchGrid.description"),
  options: [...COLOR_OPTIONS, COLUMNS_OPTION],
  build: swatchGrid,
};
