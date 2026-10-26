import { ExpressionError } from "./expression-error";
import type { ExpressionFunction, ExpressionNode, ExpressionToken } from "./expression.types";
import { tokenizeExpression } from "./tokenize-expression";

/** Each function's number of values: exact, or at least `min`. */
const FUNCTIONS: Readonly<Record<ExpressionFunction, { min: number; exact?: boolean }>> = {
  min: { min: 1 },
  max: { min: 1 },
  round: { min: 1, exact: true },
  floor: { min: 1, exact: true },
  ceil: { min: 1, exact: true },
  abs: { min: 1, exact: true },
  clamp: { min: 3, exact: true },
};

function isFunction(name: string): name is ExpressionFunction {
  return Object.hasOwn(FUNCTIONS, name);
}

/**
 * An expression's text as a tree: numbers (`12`, `.5`, `4px`, `1rem` = 16), `{references}`,
 * `+ - * /` (`* /` first, left to right), parentheses, unary minus, and `min`, `max`, `round`,
 * `floor`, `ceil`, `abs`, `clamp`. Throws an `ExpressionError` saying where it stops reading.
 */
export function parseExpression(text: string): ExpressionNode {
  const tokens = tokenizeExpression(text);
  let i = 0;
  const peek = (): ExpressionToken => tokens[i] as ExpressionToken;
  const next = (): ExpressionToken => tokens[i++] as ExpressionToken;

  const sum = (): ExpressionNode => {
    let left = product();
    for (let t = peek(); t.kind === "op" && (t.op === "+" || t.op === "-"); t = peek()) {
      next();
      left = { kind: "binary", op: t.op, left, right: product() };
    }
    return left;
  };
  const product = (): ExpressionNode => {
    let left = unary();
    for (let t = peek(); t.kind === "op" && (t.op === "*" || t.op === "/"); t = peek()) {
      next();
      left = { kind: "binary", op: t.op, left, right: unary() };
    }
    return left;
  };
  const unary = (): ExpressionNode => {
    const t = peek();
    if (t.kind === "op" && (t.op === "-" || t.op === "+")) {
      next();
      const arg = unary();
      return t.op === "-" ? { kind: "unary", op: "-", arg } : arg;
    }
    return primary();
  };
  const primary = (): ExpressionNode => {
    const t = next();
    if (t.kind === "number") return { kind: "number", value: t.value };
    if (t.kind === "ref") return { kind: "ref", ref: t.ref };
    if (t.kind === "(") {
      const inner = sum();
      close(t.at);
      return inner;
    }
    if (t.kind === "name") return call(t.name, t.at);
    throw new ExpressionError(`Expected a number or {variable} at ${t.at + 1}`, t.at);
  };
  const close = (openedAt: number) => {
    const t = next();
    if (t.kind !== ")") throw new ExpressionError(`Missing ) for the one at ${openedAt + 1}`, t.at);
  };
  const call = (name: string, at: number): ExpressionNode => {
    const fn = name.toLowerCase();
    if (!isFunction(fn)) throw new ExpressionError(`Unknown function ${name}`, at);
    const open = next();
    if (open.kind !== "(") throw new ExpressionError(`Expected ( after ${name}`, open.at);
    const args = [sum()];
    while (peek().kind === ",") {
      next();
      args.push(sum());
    }
    close(open.at);
    const { min, exact } = FUNCTIONS[fn];
    if (exact ? args.length !== min : args.length < min) {
      const count = exact ? `${min}` : `at least ${min}`;
      throw new ExpressionError(`${fn} takes ${count} value${min === 1 ? "" : "s"}`, at);
    }
    return { kind: "call", fn, args };
  };

  const tree = sum();
  const end = peek();
  if (end.kind !== "end") throw new ExpressionError(`Unexpected text at ${end.at + 1}`, end.at);
  return tree;
}
