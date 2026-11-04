import { lookup } from "./scope";
import type { DataScope, LookupResult } from "./scope.types";

/** What an expression reads, `null` when nothing is there (no such name, or no such field). */
export function readValue(scope: DataScope, expr: string): LookupResult | null {
  const found = lookup(scope, expr);
  return found && found.value !== undefined ? found : null;
}
