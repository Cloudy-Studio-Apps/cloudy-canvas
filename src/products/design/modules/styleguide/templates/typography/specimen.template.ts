import { label, SHEET_LOOK, stack } from "../../sheet";
import type { StyleguideTemplate } from "../../styleguide.types";
import { stylesOf, variablesOf } from "../template-kit";
import { stringOf } from "./font-variable-rows";
import { textStyleIn } from "./typography-kit";
import { t } from "../../styleguide.i18n";

/** Each font family the group uses: "Aa" in it, its name and the weights its styles use. */
export const specimenTemplate: StyleguideTemplate = {
  id: "typography.specimen",
  category: "typography",
  label: t("templates.typography.specimen.label"),
  description: t("templates.typography.specimen.description"),
  options: [],
  build: (group, _options, context) => {
    const weights = new Map<string, Set<string>>();
    for (const style of stylesOf(group)) {
      const value = textStyleIn(context, style);
      const family = value.fontFamily ?? SHEET_LOOK.font;
      weights.set(family, (weights.get(family) ?? new Set()).add(value.fontWeight ?? "400"));
    }
    for (const variable of variablesOf(group)) {
      const family = variable.scopes.includes("font-family") ? stringOf(context, variable.id) : "";
      if (family && !weights.has(family)) weights.set(family, new Set());
    }
    return [
      stack(
        "families",
        "horizontal",
        [...weights].map(([family, used]) =>
          stack(
            `family:${family}`,
            "vertical",
            [
              label("aa", "Aa", { font: family, size: 96, weight: "400" }),
              label("name", family, { size: 20, weight: "600" }),
              label("weights", [...used].sort().join(" · ") || "—", { color: SHEET_LOOK.muted }),
            ],
            { gap: 8 },
          ),
        ),
        { gap: 64 },
      ),
    ];
  },
};
