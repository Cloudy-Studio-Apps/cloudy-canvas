import type { DataBindableField, NodeDataFields } from "../../bindings";
import type { PickerName } from "./picker-names.types";
import type { ApplyBindData } from "./use-bind-data.types";

export interface DataFieldsBlockProps {
  /** What the layer's kind offers. */
  bindable: readonly DataBindableField[];
  fields: NodeDataFields;
  names: readonly PickerName[];
  /** Without sources: only the bound fields, so they can be unbound. */
  boundOnly: boolean;
  apply: ApplyBindData;
}
