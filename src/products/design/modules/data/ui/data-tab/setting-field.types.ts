import type { SettingSpec } from "../../settings";
import type { SettingValue } from "../../source";

export interface SettingFieldProps {
  spec: SettingSpec;
  value: SettingValue | undefined;
  /** The secrets (`key`, `key.name`) this device holds for the source. */
  stored: ReadonlySet<string>;
  onChange: (value: SettingValue) => void;
  /** A file was chosen, by its name. */
  onFilePicked?: (name: string) => void;
}
