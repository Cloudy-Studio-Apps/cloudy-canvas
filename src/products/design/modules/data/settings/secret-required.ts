import type { SettingValue } from "../source";
import type { SettingSpec } from "./setting-spec.types";

/** Whether a secret setting is needed with these settings (`required`, or `requiredWhen` holds). */
export function secretRequired(
  spec: Extract<SettingSpec, { kind: "secret" }>,
  settings: Record<string, SettingValue>,
): boolean {
  if (spec.requiredWhen) return settings[spec.requiredWhen.key] === spec.requiredWhen.value;
  return spec.required === true;
}
