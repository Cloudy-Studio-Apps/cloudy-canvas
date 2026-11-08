import { ensureFolder, projectFs } from "@platform";
import { createLibraryFile, LibraryDocument } from "@canvas";
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
import type { CreateProjectInput } from "./create-project.types";
import { firstLibraryRecords } from "./first-library";
import { t } from "./projects.i18n";
import { writeProjectImage } from "@pages/shared/projects";

/** The project's folder: `name` inside `parent`. */
export function projectRootFor(parent: string, name: string): string {
  return joinRelative(parent, name.trim());
}

/**
 * Creates `<parent>/<name>/` with the hidden data folder, the first library ("Brand system", filled
 * from `input.firstLibrary`) and the `.cproject`, and records the
 * project as opened. Throws when the name can't be a folder or the folder already exists.
 */
export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const name = input.name.trim();
  if (isReservedName(name)) throw new Error(`"${name}" can't be a project name`);
  // Read the source first, so a file that can't be read leaves nothing behind.
  const records = firstLibraryRecords(input.firstLibrary);

  const root = projectRootFor(input.parent, name);
  if (await projectFs.exists(root)) throw new Error(`"${root}" already exists`);

  const paths = projectPaths(root);
  await ensureFolder(input.parent);
  await ensureFolder(root);
  await ensureFolder(paths.data);
  await projectFs.makeHidden(paths.data);

  const library = await createLibraryFile(projectFs, root, t("firstLibrary"));
  if (records.length > 0) {
    const document = LibraryDocument.fromFile(
      await projectFs.readBytes(paths.library(library.file)),
    );
    document.setTokenRecords(records);
    await projectFs.writeBytesAtomic(paths.library(library.file), document.encodeFile());
  }

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
  return useProjectsStore.getState().open(root);
}
