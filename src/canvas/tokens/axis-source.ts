import type { ModeAxisRecord, VariableRecord } from "./token.types";

/**
 * Whether a variable may vary by an axis: the file's own may vary by any, a library's only by
 * that library's axes (a library can't point at a file's axis, nor at another library's).
 */
export function canVaryBy(variable: VariableRecord, axis: ModeAxisRecord): boolean {
  return variable.libraryId === undefined || axis.libraryId === variable.libraryId;
}

/** Throws, naming both, when `variable` can't vary by `axis` (`canVaryBy`). */
export function checkAxisSource(variable: VariableRecord, axis: ModeAxisRecord): void {
  if (canVaryBy(variable, axis)) return;
  throw new Error(
    `${variable.name} comes from a project library, so it can only vary by that library's mode groups, and ${axis.name} isn't one of them.`,
  );
}
