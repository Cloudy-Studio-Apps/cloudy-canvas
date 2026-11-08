import type { CodeColumn } from "../../model";
import { enumConstant } from "./java-enum-constant";
import type { JavaDefault } from "./java-default.types";
import type { JavaType } from "./java-type-map.types";

const NONE: JavaDefault = { init: "", comment: "" };
const NUMBER = /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/;

/** A column's default as a field initializer, or a comment when Java has no literal for it. */
export function javaDefault(
  column: CodeColumn,
  type: JavaType | null,
  keepEnumValues: boolean,
): JavaDefault {
  const value = column.default;
  if (!value || value.kind === "null") return NONE;
  const comment: JavaDefault = {
    init: "",
    comment: `default: ${value.kind === "string" ? `'${value.value}'` : value.value}`,
  };
  if (value.kind === "expr" || !type || column.array) return comment;
  const init = literal(value.value, value.kind, type, keepEnumValues);
  return init === null ? comment : { init: ` = ${init}`, comment: "" };
}

function literal(
  value: string,
  kind: "number" | "string" | "boolean",
  type: JavaType,
  keepEnumValues: boolean,
): string | null {
  switch (type.kind) {
    case "enum":
      return kind === "string" ? `${type.boxed}.${enumConstant(value, keepEnumValues)}` : null;
    case "string":
      return kind === "string" ? JSON.stringify(value) : null;
    case "uuid":
      return kind === "string" ? `UUID.fromString(${JSON.stringify(value)})` : null;
    case "boolean":
      return kind === "boolean" ? value : null;
    case "decimal":
      return NUMBER.test(value) ? `new BigDecimal("${value}")` : null;
    case "int":
    case "short":
      return kind === "number" && /^-?\d+$/.test(value) ? value : null;
    case "long":
      return kind === "number" && /^-?\d+$/.test(value) ? `${value}L` : null;
    case "float":
      return kind === "number" && NUMBER.test(value) ? `${value}f` : null;
    case "double":
      if (kind !== "number" || !NUMBER.test(value)) return null;
      return /[.eE]/.test(value) ? value : `${value}.0`;
    default:
      return null;
  }
}
