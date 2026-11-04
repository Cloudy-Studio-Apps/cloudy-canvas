import { parsePath } from "../table";
import { parseTokens } from "./parse-tokens";
import type { DataTemplate } from "./binding.types";
import type { DataScope } from "./scope.types";

/**
 * Whether an expression reads a source whose data can't be read here: its first name, up the
 * chain of scopes, is first found among a scope's `unreadable` names (a nearer name shadows it).
 */
export function readsUnreadable(scope: DataScope, expr: string): boolean {
  let first: string | undefined;
  try {
    const step = parsePath(expr)[0];
    first = step && "key" in step ? step.key : undefined;
  } catch {
    return false;
  }
  if (first === undefined) return false;
  for (let s: DataScope | null = scope; s; s = s.parent) {
    if (Object.hasOwn(s.names, first)) return false;
    if (s.unreadable.has(first)) return true;
  }
  return false;
}

/** Whether any of a template's tokens reads a source whose data can't be read here. */
export function templateReadsUnreadable(scope: DataScope, template: DataTemplate): boolean {
  return parseTokens(template.text).some(
    (part) => part.kind === "token" && readsUnreadable(scope, part.expr),
  );
}
