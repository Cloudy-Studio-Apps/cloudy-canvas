import { RESERVED_NAMES } from "../model/source-name";
import type { TemplatePart } from "./parse-tokens.types";

const TOKEN = /\{([$A-Za-z_][\w$]*(?:\.[\w$]+|\[\d+\]|\["[^"]*"\])*)\}/y;
const FIRST_NAME = /^[$A-Za-z_][\w$]*/;

/** The catalog's own placeholders (`{page}`, `{title}`…): left as text for the catalog to fill. */
const CATALOG_WORDS: ReadonlySet<string> = new Set(RESERVED_NAMES.filter((n) => n !== "item"));

/** Splits a text into plain text and `{expr}` tokens. `{{` is a literal `{`; anything that isn't an expression stays text. */
export function parseTokens(text: string): TemplatePart[] {
  const parts: TemplatePart[] = [];
  let buffer = "";
  let bufferStart = 0;
  const flush = (end: number): void => {
    if (buffer) parts.push({ kind: "text", text: buffer, start: bufferStart, end });
    buffer = "";
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i] as string;
    if (c !== "{") {
      if (!buffer) bufferStart = i;
      buffer += c;
      i++;
      continue;
    }
    if (text[i + 1] === "{") {
      if (!buffer) bufferStart = i;
      buffer += "{";
      i += 2;
      continue;
    }
    TOKEN.lastIndex = i;
    const match = TOKEN.exec(text);
    const expr = match?.[1];
    const first = expr ? FIRST_NAME.exec(expr)?.[0] : undefined;
    if (match && expr && first && !CATALOG_WORDS.has(first)) {
      flush(i);
      parts.push({ kind: "token", expr, start: i, end: i + match[0].length });
      i += match[0].length;
      continue;
    }
    if (!buffer) bufferStart = i;
    buffer += c;
    i++;
  }
  flush(text.length);
  return parts;
}
