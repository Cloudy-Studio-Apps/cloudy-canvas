import type { TextNodeElement } from "../../../text";
import type { PickerName } from "./picker-names.types";
import type { ApplyBindData } from "./use-bind-data.types";

export interface TextDataBlockProps {
  text: TextNodeElement;
  names: readonly PickerName[];
  apply: ApplyBindData;
}
