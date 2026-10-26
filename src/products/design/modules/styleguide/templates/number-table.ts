import type { SheetBuildContext, SheetGroup, GeneratedSpec } from "../styleguide.types";
import { tableRows } from "./table-rows";
import { formatNumber, leafName, numberOf, variablesOf } from "./template-kit";

/** Number variables as a table: name, value, code name, description. */
export function numberTable(
  group: SheetGroup,
  context: SheetBuildContext,
  unit = "",
): GeneratedSpec[] {
  return [
    tableRows(
      [
        { header: "Name", width: 200 },
        { header: "Value", width: 100 },
        { header: "Code", width: 200 },
        { header: "Description", width: 280 },
      ],
      variablesOf(group).map((variable) => ({
        key: `item:${variable.id}`,
        cells: [
          leafName(variable),
          `${formatNumber(numberOf(context, variable.id))}${unit}`,
          Object.values(variable.codeSyntax).find(Boolean) ?? "",
          variable.description,
        ],
      })),
    ),
  ];
}
