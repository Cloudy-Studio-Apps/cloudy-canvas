import type { SettingSpec } from "../../settings";

export interface FileFieldProps {
  spec: Extract<SettingSpec, { kind: "file" }>;
  /** The chosen file's path, `""` for none. */
  value: string;
  onChange: (path: string) => void;
  /** A file was chosen, by its name. */
  onFilePicked?: (name: string) => void;
}
