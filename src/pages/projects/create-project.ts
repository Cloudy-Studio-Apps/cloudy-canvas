import { ensureFolder, projectFs, removeCreatedFolder } from "@platform";
import { createLibraryFile } from "@canvas";
import {
  createId,
  isReservedName,
  joinRelative,
  MANIFEST_FORMAT,
  projectPaths,
  serializeManifest,
  type ProjectManifest,
  type ProjectRecord,
} from "@shared/core";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError } from "@shared/stores/toast-store";
import type { CreateProjectInput } from "./create-project.types";
import { t } from "./projects.i18n";
import { firstLibraryRecords, writeProjectImage } from "@pages/shared/projects";

/** The project's folder: `name` inside `parent`. */
export function projectRootFor(parent: string, name: string): string {
  return joinRelative(parent, name.trim());
}

/**
 * Creates `<parent>/<name>/` with the hidden data folder, the first library ("Brand system", filled
 * from `input.firstLibrary`) and the `.cproject`, and records the
 * project as opened. Throws when the name can't be a folder or the folder already exists; a
 * step failing before the `.cproject` is written removes what it made (the project's folder, and
 * the parent folder when it made that too and it's empty).
 */
export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const name = input.name.trim();
  if (isReservedName(name)) throw new Error(`"${name}" can't be a project name`);
  // Read the source first, so a file that can't be read leaves nothing behind.
  const records = firstLibraryRecords(input.firstLibrary);

  const root = projectRootFor(input.parent, name);
  if (await projectFs.exists(root)) throw new Error(`"${root}" already exists`);

  const paths = projectPaths(root);
  const madeParent = !(await projectFs.exists(input.parent));
  await ensureFolder(input.parent);
  try {
    await ensureFolder(root);
    await ensureFolder(paths.data);
    await projectFs.makeHidden(paths.data);
    const library = await createLibraryFile(projectFs, root, t("firstLibrary"), records);
    const manifest: ProjectManifest = {
      format: MANIFEST_FORMAT,
      id: createId(),
      name,
      color: input.color,
      icon: input.iconImage ? await writeProjectImage(root, "icon", input.iconImage) : input.icon,
      cover: null,
      libraries: [library],
      folders: {},
    };
    await projectFs.writeTextAtomic(paths.manifest(name), serializeManifest(manifest));
  } catch (error) {
    // Only what this made: the project's folder (new, so nothing else is in it) and an empty parent.
    try {
      await removeCreatedFolder(root, true);
      if (madeParent) await removeCreatedFolder(input.parent, false);
    } catch (cleanup) {
      notifyError(t("cleanupFailed", { path: root }), cleanup);
    }
    throw error;
  }
  return useProjectsStore.getState().open(root);
}
