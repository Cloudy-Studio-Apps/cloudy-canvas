import type { PreviewResult } from "../../update";

export interface TryResultProps {
  result: Extract<PreviewResult, { ok: true }>;
  rowsPath: string | null;
  onRowsPath: (rowsPath: string | null) => void;
}
