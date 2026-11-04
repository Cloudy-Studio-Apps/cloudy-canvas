import type { SettingValue } from "../source";
import type { SettingSpec } from "./setting-spec.types";
import { secretRequired } from "./secret-required";

function isEmpty(value: SettingValue | string | undefined): boolean {
  return (
    value === undefined || value === null || (typeof value === "string" && value.trim() === "")
  );
}

/** The keys of the required settings that are still empty. */
export function missingSettings(
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
  secrets: Record<string, string>,
): string[] {
  const missing: string[] = [];
  for (const spec of specs) {
    if (spec.kind === "secret") {
      if (secretRequired(spec, settings) && isEmpty(secrets[spec.key])) missing.push(spec.key);
    } else if (
      (spec.kind === "text" || spec.kind === "url" || spec.kind === "multiline") &&
      spec.required &&
      isEmpty(settings[spec.key])
    ) {
      missing.push(spec.key);
    }
  }
  return missing;
}

/**
 * Splits form values into what is saved in the file (`settings`) and what stays on the device
 * (`secrets`): secret settings, and the values of `pairs` with `secretValues` (keyed `key.name`).
 */
export function splitSecrets(
  specs: SettingSpec[],
  values: Record<string, SettingValue>,
): { settings: Record<string, SettingValue>; secrets: Record<string, string> } {
  const settings: Record<string, SettingValue> = { ...values };
  const secrets: Record<string, string> = {};
  for (const spec of specs) {
    if (spec.kind === "secret") {
      const value = values[spec.key];
      if (typeof value === "string" && value !== "") secrets[spec.key] = value;
      delete settings[spec.key];
    } else if (spec.kind === "pairs" && spec.secretValues) {
      const value = values[spec.key];
      if (value && typeof value === "object") {
        const names: Record<string, string> = {};
        for (const [name, v] of Object.entries(value)) {
          secrets[`${spec.key}.${name}`] = v;
          names[name] = "";
        }
        settings[spec.key] = names;
      }
    }
  }
  return { settings, secrets };
}
