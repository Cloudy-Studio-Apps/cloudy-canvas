import { box, label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { formatNumber, leafName, numberOf, variablesOf } from "../template-kit";
import { t } from "../../styleguide.i18n";

/** A ruler: a bar as long as each spacing value (bound, so it follows it), with name and value. */
export const barsTemplate: StyleguideTemplate = {
  id: "spacing.bars",
  category: "spacing",
  label: t("templates.spacing.bars.label"),
  description: t("templates.spacing.bars.description"),
  options: [
    {
      id: "color",
      label: t("templates.spacing.bars.barColor"),
      type: "select",
      default: "#6366F1",
      choices: [
        { value: "#6366F1", label: t("templates.spacing.bars.indigo") },
        { value: "#F472B6", label: t("templates.spacing.bars.pink") },
        { value: "#1F2328", label: t("templates.spacing.bars.ink") },
      ],
    },
  ],
  build: (group, options, context) => [
    stack(
      "bars",
      "vertical",
      variablesOf(group).map((variable) => {
        const value = numberOf(context, variable.id);
        return stack(
          `item:${variable.id}`,
          "horizontal",
          [
            label("name", leafName(variable), { weight: "600", width: 140 }),
            label("value", formatNumber(value), { color: SHEET_LOOK.muted, width: 60 }),
            box(
              "bar",
              Math.max(1, value),
              16,
              { name: leafName(variable), ...solidFill(String(options.color)) },
              {
                w: variable.id,
              },
            ),
          ],
          { gap: 16, counterAlign: "center" },
        );
      }),
      { gap: 12 },
    ),
  ],
};
