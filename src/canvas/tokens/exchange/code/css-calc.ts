import { parseExpression, type ExpressionNode } from "../../expression";
import { formatNumber } from "./code-names";
import type { CalcKind } from "./css-calc.types";
import type { CodeUnit } from "./code-tokens.types";

/** Functions CSS has as they are; an expression using others is written as its value. */
const CSS_FUNCTIONS = new Set(["min", "max", "clamp", "abs"]);

const isLength = (unit: CodeUnit) => unit === "px" || unit === "font-size";

/**
 * An expression as a CSS `calc()`, references as `var(--name)` (`nameOf`), each reference's own
 * unit kept (`unitOf`), literals in px where a length is needed. `null` when CSS can't say it the
 * way the app works it out: a reference code doesn't list, rounding, an opacity, or units CSS
 * refuses (a length times a length, a number plus a length); the value is written instead.
 */
export function cssCalc(
  expr: string,
  unit: CodeUnit,
  nameOf: (id: string) => string | null,
  unitOf: (id: string) => CodeUnit,
): string | null {
  if (unit === "opacity") return null;
  let tree: ExpressionNode;
  try {
    tree = parseExpression(expr);
  } catch {
    return null;
  }
  const kindOf = (node: ExpressionNode): CalcKind | null => {
    switch (node.kind) {
      case "number":
        return "free";
      case "ref":
        if (!nameOf(node.ref)) return null;
        return isLength(unitOf(node.ref)) ? "length" : "number";
      case "unary":
        return kindOf(node.arg);
      case "binary": {
        const left = kindOf(node.left);
        const right = kindOf(node.right);
        if (!left || !right) return null;
        if (node.op === "*") {
          if (left === "length" && right === "length") return null;
          return left === "length" || right === "length" ? "length" : narrowest([left, right]);
        }
        if (node.op === "/") return right === "length" ? null : left;
        return same([left, right]);
      }
      case "call": {
        if (!CSS_FUNCTIONS.has(node.fn)) return null;
        const kinds = node.args.map(kindOf);
        return kinds.includes(null) ? null : same(kinds as CalcKind[]);
      }
    }
  };
  const write = (node: ExpressionNode, want: CalcKind): string => {
    switch (node.kind) {
      case "number":
        return want === "length" ? `${formatNumber(node.value)}px` : formatNumber(node.value);
      case "ref":
        return `var(--${nameOf(node.ref) ?? ""})`;
      case "unary":
        return `(-1 * ${write(node.arg, want)})`;
      case "binary": {
        if (node.op === "+" || node.op === "-") {
          return `(${write(node.left, want)} ${node.op} ${write(node.right, want)})`;
        }
        // A product or quotient carries the length on one side only.
        const lengthLeft =
          node.op === "/" ||
          kindOf(node.left) === "length" ||
          (kindOf(node.right) !== "length" && kindOf(node.left) === "free");
        const left = write(node.left, lengthLeft ? want : "number");
        const right = write(node.right, lengthLeft ? "number" : want);
        return `(${left} ${node.op} ${right})`;
      }
      case "call":
        return `${node.fn}(${node.args.map((arg) => write(arg, want)).join(", ")})`;
    }
  };
  const target: CalcKind = isLength(unit) ? "length" : "number";
  const kind = kindOf(tree);
  if (!kind || (kind !== "free" && kind !== target)) return null;
  const body = write(tree, target);
  return `calc(${wrapped(body) ? body.slice(1, -1) : body})`;
}

/** The kind several parts added or compared together have: all the same, literals fitting any. */
function same(kinds: readonly CalcKind[]): CalcKind | null {
  const fixed = new Set(kinds.filter((k) => k !== "free"));
  if (fixed.size > 1) return null;
  return [...fixed][0] ?? "free";
}

/** A product of non-lengths: a number when both are, else free (a literal can take the px). */
function narrowest(kinds: readonly CalcKind[]): CalcKind {
  return kinds.every((k) => k === "number") ? "number" : "free";
}

/** Whether a text is one parenthesized group (its first `(` closes at its very end). */
function wrapped(text: string): boolean {
  if (!text.startsWith("(")) return false;
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") depth--;
    if (depth === 0 && i < text.length - 1) return false;
  }
  return true;
}
