import type { DataServices } from "../services";
import type { SettingSpec } from "../settings";
import type { SettingValue } from "../source";
import { ORIGIN_KEY, secretKeys, secretStoreKey } from "./source-secrets";
import { UPDATE_ERRORS } from "./update-errors";

/**
 * Where a file setting's path on this device is kept (`@<key>`, e.g. `@path`): the path belongs
 * to the device, so the file keeps only the file's name.
 */
export function filePathKey(key: string): string {
  return `@${key}`;
}

/** The file settings of a source that name a file (a non-empty value). */
function chosenFiles(specs: SettingSpec[], settings: Record<string, SettingValue>): string[] {
  return specs.flatMap((spec) =>
    spec.kind === "file" && typeof settings[spec.key] === "string" && settings[spec.key] !== ""
      ? [spec.key]
      : [],
  );
}

/** The device paths of a source's chosen files, by setting key (ones this device lacks left out). */
export async function loadFilePaths(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Promise<Record<string, string>> {
  const paths: Record<string, string> = {};
  for (const key of chosenFiles(specs, settings)) {
    const path = await services.secrets.get(secretStoreKey(sourceId, filePathKey(key)));
    if (path) paths[key] = path;
  }
  return paths;
}

/**
 * The device paths of a source's chosen files, for an Update: fails when this device has none for
 * one ("Pick the file again") or when one is inside the app's own data folder (where the secrets
 * are kept).
 */
export async function requireFilePaths(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Promise<Record<string, string>> {
  const paths = await loadFilePaths(services, sourceId, specs, settings);
  for (const key of chosenFiles(specs, settings)) {
    const path = paths[key];
    if (!path) throw new Error(UPDATE_ERRORS.pickFileAgain);
    if (await services.isPrivatePath(path)) throw new Error(UPDATE_ERRORS.privateFile);
  }
  return paths;
}

/** Every key a source may hold on this device: its secrets, their origin and its file paths. */
export function deviceKeys(specs: SettingSpec[], settings: Record<string, SettingValue>): string[] {
  const files = specs.flatMap((spec) => (spec.kind === "file" ? [filePathKey(spec.key)] : []));
  return [...secretKeys(specs, settings), ORIGIN_KEY, ...files];
}
