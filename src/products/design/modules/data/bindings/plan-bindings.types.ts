import type { DesignNode } from "../../core";

/** What filling a layer needs besides its scope. */
export interface BindingContext {
  /** The language numbers, prices and dates are written in. */
  locale: string;
  /** The asset of the picture a value names (`imageKey`), `null` when it hasn't been saved. */
  images: (value: string) => string | null;
}

/** What a layer's data fields make of it in a scope. */
export interface PlannedBindings {
  /** The fields that differ from the layer's, `null` when none does. */
  patch: Partial<DesignNode> | null;
  /** Expressions that read nothing (a typo, a field gone after an Update). */
  missing: string[];
}

/** What one `dataBindings` entry writes. */
export interface BindingWrite {
  /** Paths → values, as `setPathsPatch` takes them; `null` to leave the field alone. */
  values: Record<string, unknown> | null;
  /** An image binding whose value is empty (for "hide when empty"). */
  emptyImage: boolean;
}
