/** The functions an expression may call. */
export type ExpressionFunction = "min" | "max" | "round" | "floor" | "ceil" | "abs" | "clamp";

/** A parsed expression: numbers, `{references}`, arithmetic and function calls. */
export type ExpressionNode =
  | { kind: "number"; value: number }
  | { kind: "ref"; ref: string }
  | { kind: "unary"; op: "-"; arg: ExpressionNode }
  | { kind: "binary"; op: "+" | "-" | "*" | "/"; left: ExpressionNode; right: ExpressionNode }
  | { kind: "call"; fn: ExpressionFunction; args: ExpressionNode[] };

/** One piece of an expression's text, at its character index. */
export type ExpressionToken =
  | { kind: "number"; value: number; at: number }
  | { kind: "ref"; ref: string; at: number }
  | { kind: "name"; name: string; at: number }
  | { kind: "op"; op: "+" | "-" | "*" | "/"; at: number }
  | { kind: "("; at: number }
  | { kind: ")"; at: number }
  | { kind: ","; at: number }
  | { kind: "end"; at: number };
