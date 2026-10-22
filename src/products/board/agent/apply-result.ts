import type { ErApplyResult } from "../modules/er";
import type { DbApplyResult, DbmlError } from "../modules";

/** A text apply result for the agent: warnings on success, a thrown error (a tool error) otherwise. */
export function reportApplied(result: DbApplyResult | ErApplyResult) {
  if (!result.ok) throw new Error(`Nothing was changed. ${formatError(result.error)}`);
  return { ok: true, warnings: result.warnings.map(formatError) };
}

function formatError({ line, column, message }: DbmlError): string {
  return `Line ${line}, column ${column}: ${message}`;
}
