import type { ExtensionPoint, ExtensionPointOptions } from "./modules.types";

/** A new extension point; export it next to the code that reads it. */
export function definePoint<T>(
  id: string,
  options: ExtensionPointOptions<T> = {},
): ExtensionPoint<T> {
  return { id, ...(options.keyOf ? { keyOf: options.keyOf } : {}) };
}
