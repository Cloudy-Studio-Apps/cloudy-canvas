import { box, label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { formatNumber, leafName, numberOf, variablesOf } from "../template-kit";
import { t } from "../../styleguide.i18n";

/** Half white, half gray: what an opacity is judged against. */
const BACKDROP = "linear-gradient(90deg, #FFFFFF 50%, #9CA3AF 50%)";

/**
 * Each opacity as an ink square (its opacity bound to the variable) over a half white, half gray
 * backdrop, with its name and value.
 */
export const checkerTemplate: StyleguideTemplate = {
  id: "opacity.checker",
  category: "opacity",
  label: t("templates.opacity.checker.label"),
  description: t("templates.opacity.checker.description"),
  options: [],
  build: (group, _options, context) => [
    stack(
      "swatches",
      "horizontal",
      variablesOf(group).map((variable) => {
        const value = numberOf(context, variable.id);
        const ink = box(
          "ink",
          96,
          96,
          {
            name: leafName(variable),
            ...solidFill(SHEET_LOOK.ink),
            opacity: Math.min(1, Math.max(0, value > 1 ? value / 100 : value)),
          },
          { opacity: variable.id },
        );
        return stack(
          `item:${variable.id}`,
          "vertical",
          [
            stack("backdrop", "vertical", [ink], { gap: 0, fills: [BACKDROP] }),
            label("name", leafName(variable), { weight: "600" }),
            label("value", formatNumber(value), { color: SHEET_LOOK.muted }),
          ],
          { gap: 8 },
        );
      }),
      { gap: 32 },
    ),
  ],
};
