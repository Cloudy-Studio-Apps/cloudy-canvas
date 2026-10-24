/**
 * The number typed into a field, which may be arithmetic as in Figma ("120+24", "1920/3",
 * "-(8*2)"): numbers, + - * /, parentheses and unary signs, with a comma taken as a decimal
 * point. `null` when it isn't a number or a sum of them.
 */
export function evaluateNumber(text: string): number | null {
  const source = text.replace(/,/g, ".").replace(/\s+/g, "");
  if (!source) return null;
  let at = 0;

  const peek = () => source[at];
  const expression = (): number | null => {
    let left = term();
    while (left !== null && (peek() === "+" || peek() === "-")) {
      const op = source[at++];
      const right = term();
      if (right === null) return null;
      left = op === "+" ? left + right : left - right;
    }
    return left;
  };
  const term = (): number | null => {
    let left = factor();
    while (left !== null && (peek() === "*" || peek() === "/")) {
      const op = source[at++];
      const right = factor();
      if (right === null || (op === "/" && right === 0)) return null;
      left = op === "*" ? left * right : left / right;
    }
    return left;
  };
  const factor = (): number | null => {
    const char = peek();
    if (char === "+" || char === "-") {
      at++;
      const inner = factor();
      return inner === null ? null : char === "-" ? -inner : inner;
    }
    if (char === "(") {
      at++;
      const inner = expression();
      if (peek() !== ")") return null;
      at++;
      return inner;
    }
    const match = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(source.slice(at));
    if (!match) return null;
    at += match[0].length;
    return Number(match[0]);
  };

  const result = expression();
  return result !== null && at === source.length && Number.isFinite(result) ? result : null;
}
