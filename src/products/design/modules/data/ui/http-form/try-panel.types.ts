import type { SourceFormProps } from "../data.points.types";
import type { ConnectionDraft } from "./connection-draft.types";

export interface TryPanelProps {
  draft: ConnectionDraft;
  onPreview: NonNullable<SourceFormProps["onPreview"]>;
  rowsPath: string | null;
  onRowsPath: (rowsPath: string | null) => void;
}
