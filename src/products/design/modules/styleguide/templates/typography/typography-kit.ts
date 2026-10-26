import type { StyleRecord } from "@canvas";

import { readTextStyle, TEXT_STYLE_PATH, textStyleSummary } from "../../../text";
import { label } from "../../sheet";
import type { LabelLook } from "../../sheet";
import type { GeneratedSpec, SheetBuildContext } from "../../styleguide.types";

/** A text style's value in the context's modes (its own variables resolved). */
export function textStyleIn(context: SheetBuildContext, style: StyleRecord) {
  const value = context.resolve(style.id);
  return readTextStyle(value?.type === "style" ? value.value : style.value);
}

/** Its summary ("16/120%") in the context's modes. */
export function summaryIn(context: SheetBuildContext, style: StyleRecord): string {
  const value = context.resolve(style.id);
  return textStyleSummary(value?.type === "style" ? { ...style, value: value.value } : style);
}

/** A sample text set in a text style, bound to it so it follows the style. */
export function styledSample(
  key: string,
  text: string,
  style: StyleRecord,
  context: SheetBuildContext,
  look: LabelLook = {},
): GeneratedSpec {
  const value = textStyleIn(context, style);
  return label(
    key,
    text,
    {
      ...look,
      font: value.fontFamily ?? look.font,
      size: value.fontSize ?? look.size,
      weight: value.fontWeight ?? look.weight,
      ...(value.lineHeight !== undefined ? { lineHeight: value.lineHeight } : {}),
    },
    {},
    { [TEXT_STYLE_PATH]: style.id },
  );
}
