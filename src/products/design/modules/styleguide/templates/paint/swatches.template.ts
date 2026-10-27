import { paintStyleSummary } from "../../../core";
import { box, label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { GeneratedSpec, SheetBuildContext, StyleguideTemplate } from "../../styleguide.types";
import type { StyleRecord } from "@canvas";
import { grid, leafName, stylesOf } from "../template-kit";
import { t } from "../../styleguide.i18n";

/** A paint style's swatch (bound at `fills`), with or without its summary. */
export function paintSwatch(
  style: StyleRecord,
  context: SheetBuildContext,
  size: number,
  summary: boolean,
): GeneratedSpec {
  const value = context.resolve(style.id);
  const shown = value?.type === "style" ? { ...style, value: value.value } : style;
  return stack(
    `item:${style.id}`,
    "vertical",
    [
      box(
        "swatch",
        size,
        size,
        { name: leafName(style), ...solidFill("#E5E7EB"), cornerRadius: 6 },
        {
          fills: style.id,
        },
      ),
      label("name", leafName(style), { weight: "600", width: size }),
      ...(summary
        ? [label("summary", paintStyleSummary(shown), { color: SHEET_LOOK.muted, width: size })]
        : []),
    ],
    { gap: 8 },
  );
}

/** A swatch per paint style (gradients and pictures show as they are). */
export const paintSwatchesTemplate: StyleguideTemplate = {
  id: "paint.swatches",
  category: "paint-styles",
  label: t("templates.paint.swatches.label"),
  description: t("templates.paint.swatches.description"),
  options: [
    {
      id: "columns",
      label: t("templates.paint.swatches.columns"),
      type: "number",
      default: 6,
      min: 1,
      max: 12,
    },
    {
      id: "swatch",
      label: t("templates.paint.swatches.swatchSize"),
      type: "number",
      default: 96,
      min: 32,
      max: 240,
      step: 8,
    },
  ],
  build: (group, options, context) => [
    grid(
      "grid",
      stylesOf(group).map((style) => paintSwatch(style, context, Number(options.swatch), false)),
      Number(options.columns),
    ),
  ],
};
