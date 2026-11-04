import type { DataSourceType } from "../data.points.types";
import { holdsDevicePath } from "../settings";
import type { DataSourceElement } from "../source";
import { loadFilePaths, loadSourceSecrets, missingSecretKeys, type DataContext } from "../update";

/** The secrets a source needs that this device doesn't have (`DesignDataSources.missingSecrets`). */
export async function missingSecrets(
  source: DataSourceElement,
  { services, type }: DataContext & { type: DataSourceType },
): Promise<string[]> {
  const stored = await loadSourceSecrets(services, source.id, type, source.settings);
  return missingSecretKeys(type.settings, source.settings, stored);
}

/** The file and folder settings this device has no path for (`DesignDataSources.missingFiles`). */
export async function missingFiles(
  source: DataSourceElement,
  { services, type }: DataContext & { type: DataSourceType },
): Promise<string[]> {
  const paths = await loadFilePaths(services, source.id, type.settings, source.settings);
  return type.settings.flatMap((spec) =>
    holdsDevicePath(spec) && source.settings[spec.key] && !paths[spec.key] ? [spec.key] : [],
  );
}
