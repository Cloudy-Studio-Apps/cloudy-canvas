import type { DbmlError } from "./dbml";
import type { NameProblemMessage } from "./reconcile-error.types";

/** A problem in otherwise valid DBML (an unknown name, a duplicate, …), reported at its line. */
export class ReconcileError extends Error {
  constructor(
    message: string,
    readonly line: number,
  ) {
    super(message);
  }

  toDbmlError(): DbmlError {
    return { message: this.message, line: this.line, column: 1 };
  }
}

/**
 * Throws when two items share a name, or an item takes a name used outside the edited text.
 * `message` words each problem for the item's kind, in the caller's translations.
 */
export function checkNames(
  items: readonly { name: string; line: number }[],
  taken: ReadonlySet<string>,
  message: NameProblemMessage,
): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.name)) throw new ReconcileError(message("twice", item.name), item.line);
    if (taken.has(item.name)) throw new ReconcileError(message("taken", item.name), item.line);
    seen.add(item.name);
  }
}
