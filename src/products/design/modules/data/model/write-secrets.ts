import type { DataServices } from "../services";
import { splitSecrets, type SettingSpec } from "../settings";
import type { SettingValue } from "../source";
import { secretKeys, secretStoreKey } from "../update";

/**
 * Splits raw setting values into what the file keeps and what the device keeps, writes the
 * secrets to the store and clears stale ones. An empty or missing value keeps the stored one (a
 * form round-trip carries `""` for every secret it can't show); a secret setting given `null` is
 * deleted, and so is the value of a secret pair whose name is gone. Returns the safe settings.
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
  const kept = new Set(secretKeys(pairs, settings));
  for (const key of secretKeys(pairs, previous)) if (!kept.has(key)) writes.set(key, null);
  for (const spec of specs) {
    if (spec.kind === "secret" && values[spec.key] === null) writes.set(spec.key, null);
  }
  for (const [key, value] of Object.entries({ ...secrets, ...extra })) {
    if (value !== "") writes.set(key, value);
  }
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
