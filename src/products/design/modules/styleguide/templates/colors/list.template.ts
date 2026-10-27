import { label, SHEET_LOOK, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { fontOf, leafName, variablesOf } from "../template-kit";
import { COLOR_OPTIONS, colorSwatch, colorValues } from "./color-kit";
import { t } from "../../styleguide.i18n";

/** A vertical list: a small swatch, then the name and values on one line. */
export const listTemplate: StyleguideTemplate = {
  id: "colors.list",
  category: "colors",
  label: t("templates.colors.list.label"),
  description: t("templates.colors.list.description"),
  options: COLOR_OPTIONS.filter((option) => option.id !== "swatch"),
  build: (group, options, context) => [
    stack(
      "list",
      "vertical",
      variablesOf(group).map((variable) =>
        stack(
          `item:${variable.id}`,
          "horizontal",
          [
            colorSwatch("swatch", variable, context, 32, 32, { cornerRadius: 4 }),
            label("name", leafName(variable), { font: fontOf(options), weight: "600", width: 160 }),
            ...colorValues(variable, options, context).map((text, i) =>
              label(`value:${i}`, text, { font: fontOf(options), color: SHEET_LOOK.muted }),
            ),
          ],
          { gap: 16, counterAlign: "center" },
        ),
      ),
      { gap: 12 },
    ),
  ],
};
