import { ensureFolder, projectFs } from "@platform";
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
import { writeProjectImage } from "./project-images";

/** The project's folder: `name` inside `parent`. */
export function projectRootFor(parent: string, name: string): string {
  return joinRelative(parent, name.trim());
}

/**
 * Creates `<parent>/<name>/` with the hidden data folder and the `.cproject`, and records the
 * project as opened. Throws when the name can't be a folder or the folder already exists.
 */
export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const name = input.name.trim();
  if (isReservedName(name)) throw new Error(`"${name}" can't be a project name`);
  // The libraries' files come with the library module; until then a project starts empty.
  if (input.firstLibrary !== "empty") throw new Error("Starting from a file isn't available yet");

  const root = projectRootFor(input.parent, name);
  if (await projectFs.exists(root)) throw new Error(`"${root}" already exists`);

  const paths = projectPaths(root);
  await ensureFolder(input.parent);
  await ensureFolder(root);
  await ensureFolder(paths.data);
  await projectFs.makeHidden(paths.data);

  const manifest: ProjectManifest = {
    format: MANIFEST_FORMAT,
    id: createId(),
    name,
    color: input.color,
    icon: input.iconImage ? await writeProjectImage(root, "icon", input.iconImage) : input.icon,
    cover: null,
    libraries: [],
    folders: {},
  };
  await projectFs.writeTextAtomic(paths.manifest(name), serializeManifest(manifest));
  return useProjectsStore.getState().open(root);
}
