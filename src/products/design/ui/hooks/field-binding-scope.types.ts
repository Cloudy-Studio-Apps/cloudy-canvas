import type { FieldBinding } from "./use-field-binding.types";

/** Gives the binding of a field (or of fields set together) in place of the selection's. */
export interface FieldBindingScope {
  binding(paths: readonly string[]): FieldBinding;
}
