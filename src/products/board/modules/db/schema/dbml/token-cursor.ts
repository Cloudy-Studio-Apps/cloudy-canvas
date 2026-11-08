import { DbmlSyntaxError } from "./dbml-error";
import type { DbmlSyntaxErrorCode } from "./parser.types";
import type { Token } from "./tokenizer.types";
import { t } from "../../db.i18n";

/** Read position over a token list, with the helpers the DBML parser needs. */
export class TokenCursor {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  peek(offset = 0): Token {
    return this.tokens[Math.min(this.pos + offset, this.tokens.length - 1)]!;
  }

  next(): Token {
    const token = this.peek();
    if (token.kind !== "eof") this.pos++;
    return token;
  }

  atEnd(): boolean {
    return this.peek().kind === "eof";
  }

  isSymbol(value: string, offset = 0): boolean {
    const token = this.peek(offset);
    return token.kind === "symbol" && token.value === value;
  }

  /** Case-insensitive keyword check. */
  isKeyword(value: string, offset = 0): boolean {
    const token = this.peek(offset);
    return token.kind === "ident" && token.value.toLowerCase() === value;
  }

  acceptSymbol(value: string): boolean {
    if (!this.isSymbol(value)) return false;
    this.pos++;
    return true;
  }

  expectSymbol(value: string): Token {
    if (!this.isSymbol(value)) throw this.error(t("syntax.expectedSymbol", { symbol: value }));
    return this.next();
  }

  /** An identifier or a quoted name. */
  expectName(what: string): Token {
    const token = this.peek();
    if (token.kind !== "ident" && token.kind !== "string") throw this.expected(what);
    return this.next();
  }

  expectString(what: string): string {
    const token = this.peek();
    if (token.kind !== "string") throw this.error(t("syntax.expectedQuoted", { what }));
    return this.next().value;
  }

  /** A hex color like #cfe4f8. */
  expectColor(): string {
    if (this.peek().kind !== "color") throw this.error(t("syntax.expectedColor"));
    return this.next().value;
  }

  /** Each column, index or value is one line; it may also end at the block's closing brace. */
  expectEndOfLine(): void {
    if (this.peek().kind === "newline" || this.isSymbol("}")) return;
    throw this.error(t("syntax.expectedEndOfLine"));
  }

  skipNewlines(): void {
    while (this.peek().kind === "newline") this.pos++;
  }

  /** Skips a balanced `{ … }` block starting at the current `{`. */
  skipBlock(): void {
    this.expectSymbol("{");
    let depth = 1;
    while (depth > 0) {
      const token = this.next();
      if (token.kind === "eof") throw this.missingClosing("}");
      if (token.kind === "symbol" && token.value === "{") depth++;
      if (token.kind === "symbol" && token.value === "}") depth--;
    }
  }

  /** Skips a balanced `[ … ]` list starting at the current `[`. */
  skipBrackets(): void {
    this.expectSymbol("[");
    let depth = 1;
    while (depth > 0) {
      const token = this.next();
      if (token.kind === "eof") throw this.missingClosing("]");
      if (token.kind === "symbol" && token.value === "[") depth++;
      if (token.kind === "symbol" && token.value === "]") depth--;
    }
  }

  /** A block or list that ends before its closing `symbol`. */
  missingClosing(symbol: string, token = this.peek()): DbmlSyntaxError {
    return this.error(t("syntax.missingClosing", { symbol }), token);
  }

  /** "Expected {what}, found …"; `what` is already translated ("a name"). */
  expected(what: string, token = this.peek()): DbmlSyntaxError {
    return this.error(t("syntax.expected", { what }), token);
  }

  /** A syntax error at `token`, saying what was found there. `message` is already translated. */
  error(message: string, token = this.peek(), code?: DbmlSyntaxErrorCode): DbmlSyntaxError {
    const found =
      token.kind === "eof"
        ? t("syntax.endOfText")
        : token.kind === "newline"
          ? t("syntax.endOfLine")
          : `"${token.raw}"`;
    return new DbmlSyntaxError(
      t("syntax.found", { message, found }),
      token.line,
      token.column,
      code,
    );
  }
}
