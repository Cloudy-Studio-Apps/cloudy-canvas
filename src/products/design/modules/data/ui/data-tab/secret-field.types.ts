import type { SettingSpec } from "../../settings";

export interface SecretFieldProps {
  spec: Extract<SettingSpec, { kind: "secret" }>;
  /** Whether this device holds it. */
  stored: boolean;
  /** Whether a value was typed that isn't saved yet (a new source's form). */
  pending: boolean;
  /** A new value, or `null` to forget the stored one. */
  onChange: (value: string | null) => void;
}
