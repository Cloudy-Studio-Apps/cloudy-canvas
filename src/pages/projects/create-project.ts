import { ensureFolder, projectFs, removeCreatedFolder } from "@platform";
import { createLibraryFile } from "@canvas";
import {
  createId,
  isReservedName,
  joinRelative,
  MANIFEST_FORMAT,
  parentFolder,
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

/** The project folder a name gives inside the projects folder: `name` inside `base`. */
export function projectRootFor(base: string, name: string): string {
  return joinRelative(base, name.trim());
}

/** The highest folder of `path` that doesn't exist yet (what creating `path` makes), or null. */
async function firstMissing(path: string): Promise<string | null> {
  let missing: string | null = null;
  for (let dir = path; dir !== "" && !(await projectFs.exists(dir)); dir = parentFolder(dir)) {
    missing = dir;
  }
  return missing;
}

/**
 * Makes `input.root` a project, as JetBrains IDEs do: the folder is the project itself, new or one
 * that already holds files (they become the project's). Creates it if needed, with the hidden data
 * folder, the first library ("Brand system", filled from `input.firstLibrary`) and the `.cproject`,
 * and records the project as opened. Throws when the name can't be a project's or the folder is a
 * project already. A step failing before the `.cproject` is written removes only what this made:
 * the folders it created, or the data folder inside a folder that was already there.
 */
export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const name = input.name.trim();
  if (isReservedName(name)) throw new Error(`"${name}" can't be a project name`);
  // Read the source first, so a file that can't be read leaves nothing behind.
  const records = firstLibraryRecords(input.firstLibrary);

  const root = input.root;
  if (await projectFs.readManifestFile(root)) throw new Error(`"${root}" is a project already`);

  const paths = projectPaths(root);
  const made = await firstMissing(root);
  const madeData = made !== null || !(await projectFs.exists(paths.data));
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
    // Only what this made: folders it created (new, so nothing else is in them), else the data
    // folder it added to the user's folder, and a manifest's temporary file.
    try {
      if (made !== null) await removeCreatedFolder(made, true);
      else {
        if (madeData) await removeCreatedFolder(paths.data, true);
        const temp = `${paths.manifest(name)}.tmp`;
        if (await projectFs.exists(temp)) await projectFs.removeFile(temp);
      }
    } catch (cleanup) {
      notifyError(t("cleanupFailed", { path: root }), cleanup);
    }
    throw error;
  }
  return useProjectsStore.getState().open(root);
}
