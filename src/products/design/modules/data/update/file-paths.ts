import type { DataServices } from "../services";
import { holdsDevicePath } from "../settings";
import type { SettingSpec } from "../settings";
import type { SettingValue } from "../source";
import { ORIGIN_KEY, secretKeys, secretStoreKey } from "./source-secrets";
import { UPDATE_ERRORS } from "./update-errors";

/**
 * Where a file or folder setting's path on this device is kept (`@<key>`, e.g. `@path`,
 * `@imagesFolder`): the path belongs to the device, so the file keeps only the name.
 */
export function filePathKey(key: string): string {
  return `@${key}`;
}

/** The file (or folder) settings of a source that name one (a non-empty value). */
function chosen(
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
  kinds: readonly SettingSpec["kind"][],
): string[] {
  return specs.flatMap((spec) =>
    kinds.includes(spec.kind) && typeof settings[spec.key] === "string" && settings[spec.key] !== ""
      ? [spec.key]
      : [],
  );
}

/**
 * The device paths of a source's chosen files and folders, by setting key (ones this device
 * lacks left out).
 */
export async function loadFilePaths(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Promise<Record<string, string>> {
  const paths: Record<string, string> = {};
  for (const key of chosen(specs, settings, ["file", "folder"])) {
    const path = await services.secrets.get(secretStoreKey(sourceId, filePathKey(key)));
    if (path) paths[key] = path;
  }
  return paths;
}

/**
 * The device paths of a source's chosen files and folders, for an Update: fails when this device
 * has none for a file ("Pick the file again"; a folder may be missing: what it holds then fails
 * on its own) or when one is inside the app's own data folder (where the secrets are kept).
 */
export async function requireFilePaths(
  services: DataServices,
  sourceId: string,
  specs: SettingSpec[],
  settings: Record<string, SettingValue>,
): Promise<Record<string, string>> {
  const paths = await loadFilePaths(services, sourceId, specs, settings);
  for (const key of chosen(specs, settings, ["file"])) {
    if (!paths[key]) throw new Error(UPDATE_ERRORS.pickFileAgain);
  }
  for (const spec of specs) {
    const path = paths[spec.key];
    if (!path || !(await services.isPrivatePath(path))) continue;
    throw new Error(
      spec.kind === "folder" ? UPDATE_ERRORS.privateFolder : UPDATE_ERRORS.privateFile,
    );
  }
  return paths;
}

/** Every key a source may hold on this device: its secrets, their origin, its file and folder paths. */
export function deviceKeys(specs: SettingSpec[], settings: Record<string, SettingValue>): string[] {
  const files = specs.flatMap((spec) => (holdsDevicePath(spec) ? [filePathKey(spec.key)] : []));
  return [...secretKeys(specs, settings), ORIGIN_KEY, ...files];
}
