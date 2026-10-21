import type { DbApplyResult, DbmlError } from "../elements";

/** A text apply result for the agent: warnings on success, a thrown error (a tool error) otherwise. */
export function reportApplied(result: DbApplyResult) {
  if (!result.ok) throw new Error(`Nothing was changed. ${formatError(result.error)}`);
  return { ok: true, warnings: result.warnings.map(formatError) };
}

function formatError({ line, column, message }: DbmlError): string {
  return `Line ${line}, column ${column}: ${message}`;
}
