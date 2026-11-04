import type { ElementKinds, ResolvedValue } from "@canvas";

import type { DesignNode } from "../../core";

/** What filling a layer needs besides its scope. */
export interface BindingContext {
  /** The design's kinds: a bound field is written the way its kind writes a variable's value. */
  kinds: ElementKinds;
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

/** What one `dataBindings` entry writes: a value for its field, or a picture for its paint. */
export interface BindingWrite {
  /** The value as the field's variable type takes it; `null` to leave the field alone. */
  value: ResolvedValue | null;
  /** An image paint's new picture (`paint` is `fills.<i>` / `strokes.<i>`). */
  image: { paint: string; assetId: string } | null;
  /** An image binding whose value is empty (for "hide when empty"). */
  emptyImage: boolean;
}
