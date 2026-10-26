import type { StyleRecord } from "@canvas";

import { effectStyleSummary } from "../../../core";
import { box, label, SHEET_LOOK, solidFill, stack } from "../../sheet";
import type { GeneratedSpec, SheetBuildContext } from "../../styleguide.types";
import { leafName } from "../template-kit";

/** A white card showing an effect style (bound at `effects`), with its name and summary. */
export function effectCard(
  style: StyleRecord,
  context: SheetBuildContext,
  size: number,
): GeneratedSpec {
  const value = context.resolve(style.id);
  const shown = value?.type === "style" ? { ...style, value: value.value } : style;
  return stack(
    `item:${style.id}`,
    "vertical",
    [
      box(
        "card",
        size * 1.33,
        size,
        { name: leafName(style), ...solidFill(SHEET_LOOK.surface), cornerRadius: 8 },
        {
          effects: style.id,
        },
      ),
      label("name", leafName(style), { weight: "600" }),
      label("summary", effectStyleSummary(shown), { color: SHEET_LOOK.muted, width: size * 1.33 }),
    ],
    { gap: 12 },
  );
}
