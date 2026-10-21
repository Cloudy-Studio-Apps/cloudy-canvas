export type TokenKind =
  | "ident"
  | "string"
  /** Backtick expression, e.g. `now()`. */
  | "expr"
  | "number"
  /** Hex color, e.g. #cfe4f8. */
  | "color"
  | "symbol"
  | "newline"
  | "eof";

export interface Token {
  kind: TokenKind;
  /** Identifier/number/color text, string contents without quotes, or the symbol itself. */
  value: string;
  /** Source text exactly as written (quotes included). */
  raw: string;
  line: number;
  column: number;
}
