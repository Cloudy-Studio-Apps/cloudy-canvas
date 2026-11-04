import type { DataServices } from "../services";
import { splitSecrets, type SettingSpec } from "../settings";
import type { SettingValue } from "../source";
import { secretKeys, secretStoreKey } from "../update";

/**
 * Splits raw setting values into what the file keeps and what the device keeps, writes the
 * secrets to the store and clears stale ones: a secret pair's name that's gone, and a secret
 * setting given empty. A secret setting left out keeps its stored value. Returns the safe settings.
 */
export async function writeSecrets(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  values: Record<string, SettingValue>,
  extra: Record<string, string> = {},
  previous: Record<string, SettingValue> = {},
): Promise<Record<string, SettingValue>> {
  const { settings, secrets } = splitSecrets(specs, values);
  const writes = new Map<string, string | null>();
  const pairs = specs.filter((spec) => spec.kind === "pairs");
  for (const key of secretKeys(pairs, previous)) writes.set(key, null);
  for (const spec of specs) {
    if (spec.kind === "secret" && values[spec.key] === "") writes.set(spec.key, null);
  }
  for (const [key, value] of Object.entries(secrets)) writes.set(key, value);
  for (const [key, value] of Object.entries(extra)) writes.set(key, value === "" ? null : value);
  for (const [key, value] of writes) {
    await services.secrets.set(secretStoreKey(sourceId, key), value);
  }
  return settings;
}

/** Deletes every secret a source's settings use from this device. */
export async function clearSecrets(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Promise<void> {
  for (const key of secretKeys(specs, settings)) {
    await services.secrets.set(secretStoreKey(sourceId, key), null);
  }
}
