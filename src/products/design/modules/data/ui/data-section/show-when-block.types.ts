import type { NodeDataFields } from "../../bindings";
import type { PickerName } from "./picker-names.types";
import type { ApplyBindData } from "./use-bind-data.types";

export interface ShowWhenBlockProps {
  fields: NodeDataFields;
  names: readonly PickerName[];
  /** Without sources: only the rules set now, so they can be removed. */
  setOnly: boolean;
  apply: ApplyBindData;
}
