import type { DbmlError, DbmlSyntaxErrorCode } from "./parser.types";
import { t } from "../../db.i18n";

/** Thrown while parsing; caught by `parseDbml` and returned as a `DbmlError`. */
export class DbmlSyntaxError extends Error {
  constructor(
    message: string,
    readonly line: number,
    readonly column: number,
    /** Set on errors the parser recovers from, since the message is translated. */
    readonly code?: DbmlSyntaxErrorCode,
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
    message: t("dbml.unsupported", { what }),
    line: at.line,
    column: at.column,
  };
}
