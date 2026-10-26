import type { FigExpression, FigImportContext, FigVariableData } from "@canvas/figma";

/** Figma's arithmetic as our operators; other functions (comparisons, text…) aren't read. */
const OPERATORS: Readonly<Record<string, string>> = {
  ADDITION: "+",
  SUBTRACTION: "-",
  MULTIPLY: "*",
  DIVIDE: "/",
};

/**
 * A Figma number expression as ours (references by the ids the file's variables were given), or
 * `null` when it uses what we don't have (a library's variable, a comparison, text).
 */
export function figExpression(
  expression: FigExpression | undefined,
  ctx: FigImportContext,
): string | null {
  const fn = expression?.expressionFunction ?? "";
  const args = (expression?.expressionArguments ?? []).map((arg) => operand(arg, ctx));
  if (args.length === 0 || args.includes(null)) return null;
  if (fn === "NEGATE") return args.length === 1 ? `-${args[0]}` : null;
  const op = OPERATORS[fn];
  return op && args.length >= 2 ? args.join(` ${op} `) : null;
}

/** One argument as text: a number, a `{reference}`, or a nested expression in parentheses. */
function operand(data: FigVariableData, ctx: FigImportContext): string | null {
  const value = data.value;
  switch (data.dataType) {
    case "FLOAT":
      return typeof value?.floatValue === "number" ? String(value.floatValue) : null;
    case "ALIAS": {
      const id = ctx.tokenId(value?.alias?.guid);
      return id ? `{${id}}` : null;
    }
    case "EXPRESSION": {
      const inner = figExpression(value?.expressionValue, ctx);
      return inner === null ? null : `(${inner})`;
    }
  }
  return null;
}
