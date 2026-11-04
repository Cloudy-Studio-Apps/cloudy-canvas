import type { JsonRow } from "./json-body.types";

export interface JsonRowsEditorProps {
  rows: readonly JsonRow[];
  onChange: (rows: JsonRow[]) => void;
}
