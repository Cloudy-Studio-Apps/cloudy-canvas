import type { Completion, CompletionResult } from "@codemirror/autocomplete";

import { writtenName } from "./defined-names";
import type { SourceContext } from "./source-context.types";

const VALID_FOR = /^[\p{L}\p{N}_.]*$/u;

/** The options for the word at the cursor, or null when there are none. */
export function completionResult(
  context: SourceContext,
  options: Completion[],
): CompletionResult | null {
  if (options.length === 0) return null;
  return { from: context.from, options, validFor: VALID_FOR };
}

/** One option per name, without repeats, quoted when needed. */
export function nameOptions(names: Iterable<string>, type: string, detail: string): Completion[] {
  return [...new Set(names)].map((label) => ({ label, apply: writtenName(label), type, detail }));
}

/**
 * Only the options that start with what's typed. For places where a free name is usual too (a
 * column), so a fuzzy match doesn't take Enter from a name being typed.
 */
export function startingWith(options: Completion[], typed: string): Completion[] {
  const prefix = typed.toLowerCase();
  return options.filter((option) => option.label.toLowerCase().startsWith(prefix));
}
