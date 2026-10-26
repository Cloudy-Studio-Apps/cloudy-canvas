import { label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { GeneratedSpec, StyleguideTemplate } from "../../styleguide.types";
import { formatNumber, leafName, numberOf, variablesOf } from "../template-kit";

/** Squares as big as each value, the largest outside, nested and centered. */
export const squaresTemplate: StyleguideTemplate = {
  id: "spacing.squares",
  category: "spacing",
  label: "Nested squares",
  description: "Squares as big as each value, nested inside each other, with a legend.",
  options: [],
  build: (group, _options, context) => {
    const sorted = variablesOf(group)
      .map((variable) => ({ variable, value: numberOf(context, variable.id) }))
      .sort((a, b) => a.value - b.value);
    const tints = ["#EEF2FF", "#E0E7FF", "#C7D2FE", "#A5B4FC", "#818CF8", "#6366F1"];
    let inner: GeneratedSpec[] = [];
    sorted.forEach(({ variable, value }, i) => {
      const size = Math.max(1, value);
      const square = stack(`square:${variable.id}`, "vertical", inner, {
        gap: 0,
        align: "center",
        counterAlign: "center",
        name: leafName(variable),
        ...solidFill(tints[(sorted.length - 1 - i) % tints.length]!),
        sizing: { h: "fixed", v: "fixed" },
        w: size,
        h: size,
      });
      inner = [{ ...square, bindings: { w: variable.id, h: variable.id } }];
    });
    const legend = stack(
      "legend",
      "vertical",
      sorted.map(({ variable, value }) =>
        label(`legend:${variable.id}`, `${leafName(variable)} · ${formatNumber(value)}`, {
          color: SHEET_LOOK.muted,
        }),
      ),
      { gap: 6 },
    );
    return [stack("squares", "horizontal", [...inner, legend], { gap: 48 })];
  },
};
