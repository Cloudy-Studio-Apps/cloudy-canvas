import { box, label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { formatNumber, leafName, numberOf, variablesOf } from "../template-kit";
import { t } from "../../styleguide.i18n";

/** A box per radius with its corners rounded by it (bound), with name and value. */
export const cornersTemplate: StyleguideTemplate = {
  id: "radius.corners",
  category: "radius",
  label: t("templates.radius.corners.label"),
  description: t("templates.radius.corners.description"),
  options: [
    {
      id: "size",
      label: t("templates.radius.corners.boxSize"),
      type: "number",
      default: 96,
      min: 48,
      max: 240,
      step: 8,
    },
  ],
  build: (group, options, context) => [
    stack(
      "corners",
      "horizontal",
      variablesOf(group).map((variable) => {
        const value = numberOf(context, variable.id);
        const size = Number(options.size);
        return stack(
          `item:${variable.id}`,
          "vertical",
          [
            box(
              "box",
              size,
              size,
              {
                name: leafName(variable),
                ...solidFill("#EEF2FF"),
                stroke: "#6366F1",
                strokeWeight: 2,
                cornerRadius: value,
              },
              { cornerRadius: variable.id },
            ),
            label("name", leafName(variable), { weight: "600" }),
            label("value", formatNumber(value), { color: SHEET_LOOK.muted }),
          ],
          { gap: 8 },
        );
      }),
      { gap: 32, wrap: false },
    ),
  ],
};
