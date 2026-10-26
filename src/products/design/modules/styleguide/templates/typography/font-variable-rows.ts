import type { VariableRecord } from "@canvas";

import { label, SHEET_LOOK, stack } from "../../sheet";
import type { GeneratedSpec, SheetBuildContext } from "../../styleguide.types";
import { leafName } from "../template-kit";

/** A text variable's value in the context's modes. */
export function stringOf(context: SheetBuildContext, id: string): string {
  const value = context.resolve(id);
  return value?.type === "string" ? value.string : "";
}

/**
 * The text variables naming fonts or faces: their name, their value, and for families "Aa" set
 * in it (bound, so it follows the variable).
 */
export function fontVariableRows(
  variables: readonly VariableRecord[],
  context: SheetBuildContext,
): GeneratedSpec[] {
  return variables.map((variable) => {
    const value = stringOf(context, variable.id);
    const family = variable.scopes.includes("font-family");
    return stack(
      `item:${variable.id}`,
      "horizontal",
      [
        stack(
          "caption",
          "vertical",
          [
            label("name", leafName(variable), { weight: "600", width: 160 }),
            label("value", value, { color: SHEET_LOOK.muted, width: 160 }),
          ],
          { gap: 4 },
        ),
        ...(family
          ? [
              label(
                "sample",
                "Aa Bb Cc",
                { size: 32, font: value || SHEET_LOOK.font },
                {},
                {
                  fontFamily: variable.id,
                },
              ),
            ]
          : []),
      ],
      { gap: 32, counterAlign: "center" },
    );
  });
}
