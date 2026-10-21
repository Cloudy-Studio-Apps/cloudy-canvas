import { DbmlSyntaxError } from "./dbml-error";
import type { Token, TokenKind } from "./tokenizer.types";

const SYMBOLS = new Set(["{", "}", "[", "]", "(", ")", ":", ",", ".", ">", "<", "-", "~"]);
const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const DIGIT = /[0-9]/;
const HEX = /[0-9A-Fa-f]/;

/** Splits DBML source into tokens. Comments are dropped; newlines are kept because columns are line-based. */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let lineStart = 0;

  const push = (
    kind: TokenKind,
    value: string,
    start: number,
    startLine: number,
    startCol: number,
  ) => tokens.push({ kind, value, raw: source.slice(start, i), line: startLine, column: startCol });

  while (i < source.length) {
    const ch = source[i]!;
    const startLine = line;
    const startCol = i - lineStart + 1;
    const start = i;

    if (ch === "\n") {
      i++;
      push("newline", "\n", start, startLine, startCol);
      line++;
      lineStart = i;
    } else if (ch === " " || ch === "\t" || ch === "\r") {
      i++;
    } else if (ch === "/" && source[i + 1] === "/") {
      while (i < source.length && source[i] !== "\n") i++;
    } else if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) throw new DbmlSyntaxError("Unclosed comment", startLine, startCol);
      for (let j = i; j < end; j++) {
        if (source[j] === "\n") {
          line++;
          lineStart = j + 1;
        }
      }
      i = end + 2;
    } else if (ch === "'" && source.startsWith("'''", i)) {
      const end = source.indexOf("'''", i + 3);
      if (end === -1) throw new DbmlSyntaxError("Unclosed ''' string", startLine, startCol);
      const value = source.slice(i + 3, end);
      for (let j = i; j < end; j++) {
        if (source[j] === "\n") {
          line++;
          lineStart = j + 1;
        }
      }
      i = end + 3;
      push("string", dedent(value), start, startLine, startCol);
    } else if (ch === "'" || ch === '"' || ch === "`") {
      let value = "";
      i++;
      while (i < source.length && source[i] !== ch) {
        if (source[i] === "\n")
          throw new DbmlSyntaxError(`Unclosed ${ch} string`, startLine, startCol);
        if (source[i] === "\\" && i + 1 < source.length) i++;
        value += source[i];
        i++;
      }
      if (i >= source.length)
        throw new DbmlSyntaxError(`Unclosed ${ch} string`, startLine, startCol);
      i++;
      push(ch === "`" ? "expr" : "string", value, start, startLine, startCol);
    } else if (ch === "#" && HEX.test(source[i + 1] ?? "")) {
      i++;
      while (i < source.length && HEX.test(source[i]!)) i++;
      push("color", source.slice(start, i), start, startLine, startCol);
    } else if (DIGIT.test(ch)) {
      while (i < source.length && /[0-9.]/.test(source[i]!)) i++;
      push("number", source.slice(start, i), start, startLine, startCol);
    } else if (IDENT_START.test(ch)) {
      while (i < source.length && IDENT_PART.test(source[i]!)) i++;
      push("ident", source.slice(start, i), start, startLine, startCol);
    } else if (ch === "<" && source[i + 1] === ">") {
      i += 2;
      push("symbol", "<>", start, startLine, startCol);
    } else if (SYMBOLS.has(ch)) {
      i++;
      push("symbol", ch, start, startLine, startCol);
    } else {
      throw new DbmlSyntaxError(`Unexpected character "${ch}"`, startLine, startCol);
    }
  }

  tokens.push({ kind: "eof", value: "", raw: "", line, column: i - lineStart + 1 });
  return tokens;
}

/** Removes the common indentation of a ''' multi-line string, like DBML does. */
function dedent(value: string): string {
  const lines = value
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .split("\n");
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join("\n");
}
