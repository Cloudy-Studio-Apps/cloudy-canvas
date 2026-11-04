import type { DataBinding, DataCondition, DataTemplate } from "./binding.types";

/**
 * What `bindData` changes on a layer; what's left out stays. `null` stops a template, a binding
 * or the show condition (the layer keeps what it shows now).
 */
export interface BindDataPatch {
  text?: DataTemplate | null;
  /** Keyed by the field's path (`"fills.0.color"`, `"opacity"`, `"fills.0.image"`). */
  bindings?: Record<string, DataBinding | null>;
  visible?: DataCondition | null;
  hideWhenEmpty?: boolean;
}
