import type { StyleguideTemplate } from "../../styleguide.types";
import { tableRows } from "../table-rows";
import { formatNumber, leafName, variablesOf } from "../template-kit";

/** The other variables as a table: name, type and value in the modes shown. */
export const otherTableTemplate: StyleguideTemplate = {
  id: "other.table",
  category: "other",
  label: "Table",
  description: "Every variable's name, type and value.",
  options: [],
  build: (group, _options, context) => [
    tableRows(
      [
        { header: "Name", width: 220 },
        { header: "Type", width: 100 },
        { header: "Value", width: 320 },
        { header: "Description", width: 280 },
      ],
      variablesOf(group).map((variable) => {
        const value = context.resolve(variable.id);
        const shown =
          value?.type === "string"
            ? value.string
            : value?.type === "boolean"
              ? value.boolean
                ? "True"
                : "False"
              : value?.type === "number"
                ? formatNumber(value.number)
                : "—";
        const type =
          variable.type === "string"
            ? "Text"
            : variable.type[0]!.toUpperCase() + variable.type.slice(1);
        return {
          key: `item:${variable.id}`,
          cells: [leafName(variable), type, shown, variable.description],
        };
      }),
    ),
  ],
};
