import { DB_ENUM_COLOR } from "../../../../palette";
import type { DbEnumElement } from "../../enum";
import { formatName, formatString } from "./dbml-format";

const INDENT = "  ";

export function serializeEnum(shape: DbEnumElement): string {
  const settings =
    shape.headerColor !== DB_ENUM_COLOR ? ` [headercolor: ${shape.headerColor}]` : "";
  const lines = [`Enum ${formatName(shape.name)}${settings} {`];
  for (const value of shape.values) {
    const note = value.note ? ` [note: ${formatString(value.note)}]` : "";
    lines.push(`${INDENT}${formatName(value.name)}${note}`);
  }
  lines.push("}");
  return lines.join("\n");
}
