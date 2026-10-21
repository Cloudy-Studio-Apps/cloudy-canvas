import { DbmlSyntaxError } from "./dbml-error";
import type { Token } from "./tokenizer.types";

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
    if (!this.isSymbol(value)) throw this.error(`Expected "${value}"`);
    return this.next();
  }

  /** An identifier or a quoted name. */
  expectName(what: string): Token {
    const token = this.peek();
    if (token.kind !== "ident" && token.kind !== "string") throw this.error(`Expected ${what}`);
    return this.next();
  }

  expectString(what: string): string {
    const token = this.peek();
    if (token.kind !== "string") throw this.error(`Expected ${what} as a quoted string`);
    return this.next().value;
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
      if (token.kind === "eof") throw this.error('Missing closing "}"');
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
      if (token.kind === "eof") throw this.error('Missing closing "]"');
      if (token.kind === "symbol" && token.value === "[") depth++;
      if (token.kind === "symbol" && token.value === "]") depth--;
    }
  }

  error(message: string, token = this.peek()): DbmlSyntaxError {
    const found =
      token.kind === "eof"
        ? "end of text"
        : token.kind === "newline"
          ? "end of line"
          : `"${token.raw}"`;
    return new DbmlSyntaxError(`${message}, found ${found}`, token.line, token.column);
  }
}
