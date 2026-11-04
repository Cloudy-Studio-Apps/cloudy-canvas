import type { SettingSpec } from "../../settings";
import type { SettingValue } from "../../source";

export interface PairsFieldProps {
  spec: Extract<SettingSpec, { kind: "pairs" }>;
  value: SettingValue | undefined;
  /** The secrets (`key.name`) this device holds. */
  stored: ReadonlySet<string>;
  onChange: (value: Record<string, string>) => void;
}
