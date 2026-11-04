import type { DataSourceType } from "../data.points.types";
import type { DataServices } from "../services";
import { baseName, isAbsolutePath, splitSecrets } from "../settings";
import type { SettingSpec } from "../settings";
import type { SettingValue } from "../source";
import { deviceKeys, filePathKey, ORIGIN_KEY, secretKeys, secretStoreKey } from "../update";

/**
 * Splits raw setting values into what the file keeps and what the device keeps, writes the
 * secrets to the store and clears stale ones. An empty or missing value keeps the stored one (a
 * form round-trip carries `""` for every secret it can't show); a secret setting given `null` is
 * deleted, and so is the value of a secret pair whose name is gone. Secrets typed now bind the
 * type's `secretOrigin` (the link's origin); when that moves, the ones not typed again are
 * deleted, so they never follow a link to another site. A file setting given an absolute path
 * keeps that path on the device (`@<key>`) and only the file's name in the settings. Returns the
 * safe settings.
 */
export async function writeSecrets(
  services: DataServices,
  sourceId: string,
  type: DataSourceType,
  values: Record<string, SettingValue>,
  extra: Record<string, string> = {},
  previous: Record<string, SettingValue> = {},
): Promise<Record<string, SettingValue>> {
  const specs = type.settings;
  const { settings, secrets } = splitSecrets(specs, values);
  const writes = new Map<string, string | null>();
  const pairs = specs.filter((spec) => spec.kind === "pairs");
  const kept = new Set(secretKeys(pairs, settings));
  for (const key of secretKeys(pairs, previous)) if (!kept.has(key)) writes.set(key, null);
  for (const spec of specs) {
    if (spec.kind === "secret" && values[spec.key] === null) writes.set(spec.key, null);
  }
  let entered = false;
  for (const [key, value] of Object.entries({ ...secrets, ...extra })) {
    if (value === "") continue;
    writes.set(key, value);
    entered = true;
  }
  if (type.secretOrigin && entered) {
    const origin = type.secretOrigin(settings);
    const bound = await services.secrets.get(secretStoreKey(sourceId, ORIGIN_KEY));
    if (bound !== origin) {
      for (const key of secretKeys(specs, settings)) if (!writes.has(key)) writes.set(key, null);
    }
    writes.set(ORIGIN_KEY, origin);
  }
  for (const spec of specs) {
    if (spec.kind !== "file") continue;
    const value = values[spec.key];
    if (typeof value === "string" && isAbsolutePath(value)) {
      writes.set(filePathKey(spec.key), value);
      settings[spec.key] = baseName(value);
    } else if (value !== previous[spec.key]) {
      // Another name (or none) than the one this device's path is for: that path is stale.
      writes.set(filePathKey(spec.key), null);
    }
  }
  for (const [key, value] of writes) {
    await services.secrets.set(secretStoreKey(sourceId, key), value);
  }
  return settings;
}

/** Deletes everything a source keeps on this device: its secrets, their origin, its file paths. */
export async function clearSecrets(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Promise<void> {
  for (const key of deviceKeys(specs, settings)) {
    await services.secrets.set(secretStoreKey(sourceId, key), null);
  }
}
