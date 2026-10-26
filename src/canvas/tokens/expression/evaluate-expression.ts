import type { ExpressionNode } from "./expression.types";

/**
 * An expression's value, each reference read with `valueOf`; `null` when a reference has none
 * or the result isn't a finite number (a division by zero).
 */
export function evaluateExpression(
  node: ExpressionNode,
  valueOf: (ref: string) => number | null,
): number | null {
  const result = evaluate(node, valueOf);
  return result !== null && Number.isFinite(result) ? result : null;
}

function evaluate(node: ExpressionNode, valueOf: (ref: string) => number | null): number | null {
  switch (node.kind) {
    case "number":
      return node.value;
    case "ref":
      return valueOf(node.ref);
    case "unary": {
      const arg = evaluate(node.arg, valueOf);
      return arg === null ? null : -arg;
    }
    case "binary": {
      const left = evaluate(node.left, valueOf);
      const right = evaluate(node.right, valueOf);
      if (left === null || right === null) return null;
      if (node.op === "+") return left + right;
      if (node.op === "-") return left - right;
      if (node.op === "*") return left * right;
      return left / right;
    }
    case "call": {
      const args: number[] = [];
      for (const arg of node.args) {
        const value = evaluate(arg, valueOf);
        if (value === null) return null;
        args.push(value);
      }
      const [x = 0, lo = 0, hi = 0] = args;
      switch (node.fn) {
        case "min":
          return Math.min(...args);
        case "max":
          return Math.max(...args);
        case "round":
          return Math.round(x);
        case "floor":
          return Math.floor(x);
        case "ceil":
          return Math.ceil(x);
        case "abs":
          return Math.abs(x);
        case "clamp":
          return Math.min(Math.max(x, lo), hi);
      }
    }
  }
}
