import { joinTokenColor, type TokenValue, type VariableType } from "@canvas";
import { hexOf, type FigImportContext, type FigVariableData } from "@canvas/figma";

import { figExpression } from "./fig-expression";

const TYPES: Record<string, VariableType> = {
  COLOR: "color",
  FLOAT: "number",
  STRING: "string",
  BOOLEAN: "boolean",
};

/** A Figma variable's type as ours, or `null` for types we don't have. */
export function figVariableType(type: string | undefined): VariableType | null {
  return type ? (TYPES[type] ?? null) : null;
}

/**
 * A stored variable value as ours: a raw value, an alias of a variable the file holds, or a
 * number expression over them.
 * `null` (with a warning) for an alias of a library's variable or a kind of value we don't read.
 */
export function figVariableValue(
  data: FigVariableData | undefined,
  ctx: FigImportContext,
): TokenValue | null {
  const value = data?.value;
  switch (data?.dataType) {
    case "ALIAS": {
      const id = ctx.tokenId(value?.alias?.guid);
      if (!id) ctx.warnings.add("variables aliasing a library's variables lost those values");
      return id ? { alias: id } : null;
    }
    case "COLOR":
      return value?.colorValue
        ? { color: joinTokenColor(hexOf(value.colorValue), value.colorValue.a) }
        : null;
    case "FLOAT":
      return typeof value?.floatValue === "number" ? { number: value.floatValue } : null;
    case "STRING":
      return typeof value?.textValue === "string" ? { string: value.textValue } : null;
    case "BOOLEAN":
      return typeof value?.boolValue === "boolean" ? { boolean: value.boolValue } : null;
    case "EXPRESSION": {
      const expr =
        data.resolvedDataType === "FLOAT" ? figExpression(value?.expressionValue, ctx) : null;
      if (expr) return { expr };
      ctx.warnings.add("variable expressions Cloudy Canvas doesn't have were left out");
      return null;
    }
  }
  ctx.warnings.add(`${(data?.dataType ?? "unknown").toLowerCase()} variable values were left out`);
  return null;
}
