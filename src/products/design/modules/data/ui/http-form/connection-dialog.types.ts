import type { SettingValue } from "../../source";
import type { SourceFormProps } from "../data.points.types";
import type { ConnectionTab } from "./connection-tabs.types";

export interface ConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The tab it opens on. */
  tab: ConnectionTab;
  values: Record<string, SettingValue>;
  stored: ReadonlySet<string>;
  onSave: (values: Record<string, SettingValue>) => void;
  onPreview?: SourceFormProps["onPreview"];
  rowsPath: string | null;
  onRowsPathChange?: (rowsPath: string | null) => void;
}
