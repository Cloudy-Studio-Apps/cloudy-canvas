import { zipSync } from "fflate";

import { exportFile, projectFs } from "@platform";
import { PROJECT_DATA_DIR, TRASH_DIR, joinRelative, projectPaths } from "@shared/core";
import { joinRel } from "./project-rel";
import { t } from "./project.i18n";

/** Reads every file under `rel` into `files`, keyed by path in the archive; the trash is left out. */
async function collect(
  root: string,
  rel: string,
  files: Record<string, Uint8Array>,
): Promise<void> {
  for (const entry of await projectFs.scan(root, rel === "" ? undefined : rel)) {
    if (entry.rel === joinRel(PROJECT_DATA_DIR, TRASH_DIR)) continue;
    if (entry.kind === "folder") await collect(root, entry.rel, files);
    else files[entry.rel] = await projectFs.readBytes(joinRelative(root, entry.rel));
  }
}

/**
 * Packs the whole project (its files, folders, `.cproject` and `.cloudy` data) into a .zip the
 * user saves. Returns whether it was saved.
 */
export async function exportProjectZip(root: string, name: string): Promise<boolean> {
  const files: Record<string, Uint8Array> = {};
  files[`${name}.cproject`] = await projectFs.readBytes(projectPaths(root).manifest(name));
  await collect(root, "", files);
  await collect(root, PROJECT_DATA_DIR, files);
  const zip = zipSync(files, { level: 1 });
  return exportFile(new Blob([zip as Uint8Array<ArrayBuffer>]), name, {
    extension: "zip",
    label: t("more.zipLabel"),
  });
}
