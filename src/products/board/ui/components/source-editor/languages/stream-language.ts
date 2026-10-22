import { StreamLanguage } from "@codemirror/language";
import type { StringStream } from "@codemirror/language";
import { tags } from "@lezer/highlight";

import type { SourceLanguageSpec, SourceLanguageState } from "./stream-language.types";

const WORD = /^[\p{L}_][\p{L}\p{N}_]*/u;

/** The highlight tag of each token name `token` returns. */
const TOKEN_TAGS = {
  keyword: tags.keyword,
  definition: tags.definition(tags.typeName),
  propertyName: tags.propertyName,
  typeName: tags.typeName,
  variableName: tags.variableName,
  modifier: tags.modifier,
  string: tags.string,
  special: tags.special(tags.string),
  number: tags.number,
  color: tags.color,
  operator: tags.operator,
  brace: tags.brace,
  squareBracket: tags.squareBracket,
  paren: tags.paren,
  punctuation: tags.punctuation,
  comment: tags.comment,
};

/**
 * Syntax colors for the board's DBML-like languages (DBML, ER text). It reads the text line by
 * line and never fails on half-typed text, unlike the parser, so it's written apart from it.
 */
export function createSourceLanguage(spec: SourceLanguageSpec) {
  const blockKeywords = new Set(spec.blockKeywords);
  const settings = new Set(spec.settings);

  const word = (state: SourceLanguageState, text: string): string => {
    const lower = text.toLowerCase();
    if (state.inSettings) return settings.has(lower) ? "modifier" : "variableName";
    const index = state.words++;
    if (state.afterKeyword) {
      state.afterKeyword = blockKeywords.has(lower);
      return state.afterKeyword ? "keyword" : "definition";
    }
    if (blockKeywords.has(lower) && (index === 0 || lower === "as")) {
      state.afterKeyword = true;
      return "keyword";
    }
    if (state.depth > 0 && index === 0) return "propertyName";
    if (state.depth > 0 && index === 1 && spec.typeAfterName) return "typeName";
    return "variableName";
  };

  return StreamLanguage.define<SourceLanguageState>({
    name: spec.name,
    startState: () => ({
      open: null,
      depth: 0,
      inSettings: false,
      words: 0,
      afterKeyword: false,
    }),
    copyState: (state) => ({ ...state }),
    token(stream, state) {
      if (stream.sol()) {
        state.words = 0;
        state.afterKeyword = false;
      }
      if (state.open === "comment") return closeAt(stream, state, "*/", "comment");
      if (state.open === "string") return closeAt(stream, state, "'''", "string");
      if (stream.eatSpace()) return null;

      if (stream.match("//")) {
        stream.skipToEnd();
        return "comment";
      }
      if (stream.match("/*")) {
        state.open = "comment";
        return closeAt(stream, state, "*/", "comment");
      }
      if (stream.match("'''")) {
        state.open = "string";
        return closeAt(stream, state, "'''", "string");
      }
      const quote = stream.peek();
      if (quote === "'" || quote === '"' || quote === "`") {
        stream.next();
        let escaped = false;
        for (let ch = stream.next(); ch !== undefined; ch = stream.next()) {
          if (ch === quote && !escaped) break;
          escaped = !escaped && ch === "\\";
        }
        state.afterKeyword = false;
        if (!state.inSettings) state.words++;
        return quote === "`" ? "special" : "string";
      }
      if (stream.match(/^#[0-9A-Fa-f]+/)) return "color";
      if (stream.match(/^[0-9][0-9.]*/)) return "number";
      const text = stream.match(WORD);
      if (text && typeof text !== "boolean") return word(state, text[0]);

      const ch = stream.next() ?? "";
      if (ch === "{") {
        state.depth++;
        state.afterKeyword = false;
        return "brace";
      }
      if (ch === "}") {
        state.depth = Math.max(0, state.depth - 1);
        return "brace";
      }
      if (ch === "[") {
        state.inSettings = true;
        return "squareBracket";
      }
      if (ch === "]") {
        state.inSettings = false;
        return "squareBracket";
      }
      if (ch === "(" || ch === ")") return "paren";
      if (ch === "<" && stream.eat(">")) return "operator";
      if (">-<~".includes(ch)) return "operator";
      return "punctuation";
    },
    blankLine(state) {
      state.words = 0;
      state.afterKeyword = false;
    },
    tokenTable: TOKEN_TAGS,
    languageData: { commentTokens: { line: "//", block: { open: "/*", close: "*/" } } },
  });
}

/** Consumes up to and including `end`, or the rest of the line if it isn't there. */
function closeAt(
  stream: StringStream,
  state: SourceLanguageState,
  end: string,
  style: string,
): string {
  const rest = stream.string.slice(stream.pos);
  const at = rest.indexOf(end);
  if (at === -1) {
    stream.skipToEnd();
  } else {
    stream.pos += at + end.length;
    state.open = null;
  }
  return style;
}
