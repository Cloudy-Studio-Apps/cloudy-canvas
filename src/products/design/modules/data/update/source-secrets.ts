import type { DataSourceType } from "../data.points.types";
import type { DataServices } from "../services";
import type { SettingSpec } from "../settings";
import type { SettingValue } from "../source";

/** Where the origin a source's secrets were entered for is kept (`DataSourceType.secretOrigin`). */
export const ORIGIN_KEY = "@origin";

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

/**
 * The secrets this device may use for a source as its settings are now: none when the type binds
 * them to an origin (`secretOrigin`, a link's) and that isn't the one they were entered for, so a
 * key typed for one site is never sent to another. They then read as missing until given again.
 */
export async function loadSourceSecrets(
  services: DataServices,
  sourceId: string,
  type: DataSourceType,
  settings: Record<string, SettingValue>,
): Promise<Record<string, string>> {
  const secrets = await loadSecrets(services, sourceId, secretKeys(type.settings, settings));
  if (!type.secretOrigin || Object.keys(secrets).length === 0) return secrets;
  const origin = type.secretOrigin(settings);
  const bound = await services.secrets.get(secretStoreKey(sourceId, ORIGIN_KEY));
  return origin !== null && bound === origin ? secrets : {};
}
