import { STROKE_STYLE_PATH, strokeStyleSummary } from "../../../core";
import { box, label, SHEET_LOOK, stack } from "../../sheet";
import type { GeneratedSpec, SheetBuildContext, SheetGroup } from "../../styleguide.types";
import { formatNumber, leafName, numberOf, stylesOf, variablesOf } from "../template-kit";

/**
 * One sample per stroke style (bound at `strokeStyle`) and per stroke weight number (bound at
 * `strokeWeight`), drawn by `shape` (its size), with its name and description.
 */
export function strokeSamples(
  group: SheetGroup,
  context: SheetBuildContext,
  size: { w: number; h: number },
  direction: "horizontal" | "vertical",
): GeneratedSpec[] {
  const base = { fills: [], stroke: SHEET_LOOK.ink, strokeAlign: "center" };
  const items = [
    ...stylesOf(group).map((style) => {
      const value = context.resolve(style.id);
      const shown = value?.type === "style" ? { ...style, value: value.value } : style;
      return {
        id: style.id,
        name: leafName(style),
        detail: strokeStyleSummary(shown),
        sample: box(
          "sample",
          size.w,
          size.h,
          { name: leafName(style), ...base, strokeWeight: 1 },
          {
            [STROKE_STYLE_PATH]: style.id,
          },
        ),
      };
    }),
    ...variablesOf(group).map((variable) => {
      const weight = numberOf(context, variable.id);
      return {
        id: variable.id,
        name: leafName(variable),
        detail: formatNumber(weight),
        sample: box(
          "sample",
          size.w,
          size.h,
          { name: leafName(variable), ...base, strokeWeight: weight },
          {
            strokeWeight: variable.id,
          },
        ),
      };
    }),
  ];
  return [
    stack(
      "samples",
      direction,
      items.map((item) =>
        stack(
          `item:${item.id}`,
          direction === "vertical" ? "horizontal" : "vertical",
          [
            item.sample,
            stack(
              "caption",
              "vertical",
              [
                label("name", item.name, { weight: "600" }),
                label("detail", item.detail, { color: SHEET_LOOK.muted }),
              ],
              { gap: 4 },
            ),
          ],
          { gap: 16, counterAlign: direction === "vertical" ? "center" : "start" },
        ),
      ),
      { gap: direction === "vertical" ? 20 : 32 },
    ),
  ];
}
