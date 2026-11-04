import type { SettingSpec } from "../../settings";

export interface SecretFieldProps {
  spec: Extract<SettingSpec, { kind: "secret" }>;
  /** Whether this device holds it. */
  stored: boolean;
  /** A new value, or `null` to forget the stored one. */
  onChange: (value: string | null) => void;
}
