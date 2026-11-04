import type { SettingSpec } from "../../settings";
import type { SettingValue } from "../../source";

export interface SettingsFormProps {
  specs: readonly SettingSpec[];
  values: Record<string, SettingValue>;
  /** The secrets (`key`, `key.name`) this device holds for the source. */
  stored: ReadonlySet<string>;
  /** Every value, with the one that changed. */
  onChange: (values: Record<string, SettingValue>) => void;
  onFilePicked?: (name: string) => void;
}
