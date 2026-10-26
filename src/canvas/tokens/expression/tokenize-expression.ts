import { ExpressionError } from "./expression-error";
import type { ExpressionToken } from "./expression.types";

const NUMBER = /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i;
const UNIT = /^(px|rem)(?![a-z0-9_])/i;
const NAME = /^[a-z_][a-z0-9_]*/i;
/** A `rem` in pixels, as the token formats read it. */
const REM_PX = 16;

/** An expression's text as tokens, ending with an `end` token; throws on what isn't one. */
export function tokenizeExpression(text: string): ExpressionToken[] {
  const tokens: ExpressionToken[] = [];
  let at = 0;
  while (at < text.length) {
    const rest = text.slice(at);
    const char = rest[0] as string;
    if (/\s/.test(char)) {
      at++;
      continue;
    }
    if (char === "{") {
      const close = rest.indexOf("}");
      if (close < 0) throw new ExpressionError(`Missing } for the reference at ${at + 1}`, at);
      const ref = rest.slice(1, close).trim();
      if (!ref) throw new ExpressionError(`Empty reference at ${at + 1}`, at);
      tokens.push({ kind: "ref", ref, at });
      at += close + 1;
      continue;
    }
    const number = NUMBER.exec(rest);
    if (number) {
      let length = number[0].length;
      let value = Number(number[0]);
      const unit = UNIT.exec(rest.slice(length));
      if (unit) {
        if (unit[1]?.toLowerCase() === "rem") value *= REM_PX;
        length += unit[0].length;
      }
      tokens.push({ kind: "number", value, at });
      at += length;
      continue;
    }
    const name = NAME.exec(rest);
    if (name) {
      tokens.push({ kind: "name", name: name[0], at });
      at += name[0].length;
      continue;
    }
    if (char === "+" || char === "-" || char === "*" || char === "/") {
      tokens.push({ kind: "op", op: char, at });
    } else if (char === "(" || char === ")" || char === ",") {
      tokens.push({ kind: char, at });
    } else {
      throw new ExpressionError(`Unexpected "${char}" at ${at + 1}`, at);
    }
    at++;
  }
  tokens.push({ kind: "end", at });
  return tokens;
}
