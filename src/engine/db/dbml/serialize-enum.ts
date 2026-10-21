import { DB_ENUM_COLOR, type DbEnumShape } from "../../document";
import { formatName, formatString } from "./dbml-format";

const INDENT = "  ";

export function serializeEnum(shape: DbEnumShape): string {
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
