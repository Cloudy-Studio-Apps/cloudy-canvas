import type { DataServices } from "../services";
import type { SettingSpec } from "../settings";
import type { SettingValue } from "../source";

/** Where a source's secret is kept on this device (`key`, or `key.name` for a pair's value). */
export function secretStoreKey(sourceId: string, key: string): string {
  return `data-source:${sourceId}:${key}`;
}

/** The secret keys a source's settings use: its secret settings and its secret pairs' names. */
export function secretKeys(specs: SettingSpec[], settings: Record<string, SettingValue>): string[] {
  const keys: string[] = [];
  for (const spec of specs) {
    if (spec.kind === "secret") keys.push(spec.key);
    else if (spec.kind === "pairs" && spec.secretValues) {
      const value = settings[spec.key];
      if (value && typeof value === "object") {
        for (const name of Object.keys(value)) keys.push(`${spec.key}.${name}`);
      }
    }
  }
  return keys;
}

/**
 * The secrets a source needs that `stored` lacks (by `key` / `key.name`): its required secret
 * settings and every secret pair's value.
 */
export function missingSecretKeys(
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
  stored: Record<string, string>,
): string[] {
  const optional = new Set(
    specs.flatMap((s) => (s.kind === "secret" && !s.required ? [s.key] : [])),
  );
  return secretKeys(specs, settings).filter((key) => !(key in stored) && !optional.has(key));
}

/** A source's secrets stored on this device, by `key` / `key.name` (missing or empty ones left out). */
export async function loadSecrets(
  services: DataServices,
  sourceId: string,
  keys: string[],
): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};
  for (const key of keys) {
    const value = await services.secrets.get(secretStoreKey(sourceId, key));
    if (value !== null && value !== "") secrets[key] = value;
  }
  return secrets;
}
