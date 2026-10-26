import type { ModeContext, TokenStore } from "@canvas";

import type { GeneratedSpec, SheetGroup } from "../styleguide.types";
import { SHEET_LOOK } from "./sheet-look";
import { label, prefixKeys, stack } from "./spec-builders";

/**
 * A group's body once per mode, side by side: one column per mode of the axis its variables vary
 * by, each picking its mode (`variableModes`) so what's bound in it shows that mode's values. A
 * group nothing in varies by an axis gets its plain body.
 */
export function modeColumns(
  group: SheetGroup,
  store: TokenStore,
  base: ModeContext,
  build: (modes: ModeContext) => GeneratedSpec[],
): GeneratedSpec[] {
  const axisId = group.items
    .map((item) => (item.kind === "variable" ? item.record.axisId : null))
    .find((id): id is string => !!id && !!store.axis(id));
  const axis = axisId ? store.axis(axisId) : undefined;
  if (!axis || axis.modes.length < 2) return build(base);
  const columns = axis.modes.map((mode) =>
    stack(
      `mode:${mode.id}`,
      "vertical",
      [
        label("mode-name", mode.name, { size: SHEET_LOOK.label, color: SHEET_LOOK.muted }),
        ...prefixKeys(`mode:${mode.id}/`, build({ ...base, [axis.id]: mode.id })),
      ],
      { gap: SHEET_LOOK.titleGap },
    ),
  );
  return [
    {
      ...stack("modes", "horizontal", columns, { gap: SHEET_LOOK.groupGap }),
      children: columns.map((column, i) => ({
        ...column,
        variableModes: { [axis.id]: axis.modes[i]!.id },
      })),
    },
  ];
}
