import type { DbmlError } from "./parser.types";

/** Thrown while parsing; caught by `parseDbml` and returned as a `DbmlError`. */
export class DbmlSyntaxError extends Error {
  constructor(
    message: string,
    readonly line: number,
    readonly column: number,
  ) {
    super(message);
  }

  toError(): DbmlError {
    return { message: this.message, line: this.line, column: this.column };
  }
}

/** Warning for a recognized construct that the board doesn't support yet. */
export function unsupported(what: string, at: { line: number; column: number }): DbmlError {
  return {
    message: `${what} isn't supported yet and was ignored`,
    line: at.line,
    column: at.column,
  };
}
