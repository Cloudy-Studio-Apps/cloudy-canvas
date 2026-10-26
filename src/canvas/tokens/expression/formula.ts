import type { ExpressionNode } from "./expression.types";
import type {
  Formula,
  FormulaChain,
  FormulaOperand,
  FormulaRounding,
  FormulaValue,
} from "./formula.types";
import { parseExpression } from "./parse-expression";

const ROUNDINGS = new Set<string>(["round", "floor", "ceil"]);

/**
 * An expression as the builder's `Formula`, or `null` when it isn't that shape (or doesn't read):
 * a start and steps left to right (`({a} + 2) * 3`), a step's value possibly a group of its own
 * (`{a} * ({b} + {c})`; what's worked out first, `{a} + 2 * 3`, reads as one), optionally
 * rounded, optionally limited (`clamp(x, lo, hi)`, `max(x, lo)`, `min(x, hi)`).
 */
export function formulaOf(text: string): Formula | null {
  let node: ExpressionNode;
  try {
    node = parseExpression(text);
  } catch {
    return null;
  }
  let min: FormulaValue | null = null;
  let max: FormulaValue | null = null;
  if (node.kind === "call" && node.fn === "clamp") {
    min = valueOf(node.args[1]);
    max = valueOf(node.args[2]);
    if (!min || !max) return null;
    node = node.args[0] as ExpressionNode;
  } else if (
    node.kind === "call" &&
    (node.fn === "max" || node.fn === "min") &&
    node.args.length === 2
  ) {
    const limit = valueOf(node.args[1]);
    if (!limit) return null;
    if (node.fn === "max") min = limit;
    else max = limit;
    node = node.args[0] as ExpressionNode;
  }
  let rounding: FormulaRounding = "none";
  if (node.kind === "call" && ROUNDINGS.has(node.fn)) {
    rounding = node.fn as FormulaRounding;
    node = node.args[0] as ExpressionNode;
  }
  const chain = chainOf(node);
  return chain ? { ...chain, rounding, min, max } : null;
}

/** A formula as an expression's text (references by id), parenthesized to keep left to right. */
export function formulaText(formula: Formula): string {
  let text = chainText(formula);
  if (formula.rounding !== "none") text = `${formula.rounding}(${text})`;
  const { min, max } = formula;
  if (min && max) return `clamp(${text}, ${valueText(min)}, ${valueText(max)})`;
  if (min) return `max(${text}, ${valueText(min)})`;
  if (max) return `min(${text}, ${valueText(max)})`;
  return text;
}

/** A node as a chain: its left-leaning operations as steps, each right side a value or group. */
function chainOf(node: ExpressionNode): FormulaChain | null {
  const steps: FormulaChain["steps"] = [];
  while (node.kind === "binary") {
    const operand = operandOf(node.right);
    if (!operand) return null;
    steps.unshift({ op: node.op, operand });
    node = node.left;
  }
  const start = valueOf(node);
  return start ? { start, steps } : null;
}

function chainText(chain: FormulaChain): string {
  let text = valueText(chain.start);
  let additive = false;
  for (const { op, operand } of chain.steps) {
    const multiplies = op === "*" || op === "/";
    if (multiplies && additive) text = `(${text})`;
    const right = operand.kind === "group" ? `(${chainText(operand.chain)})` : valueText(operand);
    text = `${text} ${op} ${right}`;
    additive = !multiplies;
  }
  return text;
}

function operandOf(node: ExpressionNode): FormulaOperand | null {
  if (node.kind === "binary") {
    const chain = chainOf(node);
    return chain ? { kind: "group", chain } : null;
  }
  return valueOf(node);
}

function valueText(value: FormulaValue): string {
  return value.kind === "variable" ? `{${value.id}}` : String(value.value);
}

function valueOf(node: ExpressionNode | undefined): FormulaValue | null {
  if (node?.kind === "ref") return { kind: "variable", id: node.ref };
  if (node?.kind === "number") return { kind: "number", value: node.value };
  if (node?.kind === "unary" && node.arg.kind === "number") {
    return { kind: "number", value: -node.arg.value };
  }
  return null;
}
