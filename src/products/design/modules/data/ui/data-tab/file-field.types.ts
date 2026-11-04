import type { SettingSpec } from "../../settings";

export interface FileFieldProps {
  spec: Extract<SettingSpec, { kind: "file" | "folder" }>;
  /** The chosen file or folder: its name as the document keeps it, or a path just picked; `""` for none. */
  value: string;
  /** Whether this device knows where it is (else it has to be picked again here). */
  onDevice: boolean;
  onChange: (path: string) => void;
  /** A file was chosen, by its name (not called for a folder). */
  onFilePicked?: (name: string) => void;
}
