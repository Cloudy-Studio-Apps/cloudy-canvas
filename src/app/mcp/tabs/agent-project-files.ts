import { projectFs, projectRegistry, projectsSupported } from "@platform";
import { fileNameFromPath, joinRelative, type FileType, type ProjectRecord } from "@shared/core";

/** How deep inside a project's folders agents look for a file by name. */
const MAX_DEPTH = 6;

/** The projects this device knows (none where projects aren't supported). */
export async function knownProjects(): Promise<ProjectRecord[]> {
  return projectsSupported() ? projectRegistry.list() : [];
}

/**
 * The paths of a project's files of one type whose name (without extension) passes `wanted`,
 * looking through its folders with the project page's scanner (`projectFs.scan`). A project whose
 * folder can't be read has none.
 */
export async function projectFilesNamed(
  project: ProjectRecord,
  type: FileType,
  wanted: (name: string) => boolean,
): Promise<string[]> {
  const found: string[] = [];
  const walk = async (rel: string, depth: number): Promise<void> => {
    const entries = await projectFs.scan(project.root, rel === "" ? undefined : rel);
    for (const entry of entries) {
      if (entry.kind === "folder" && depth < MAX_DEPTH) await walk(entry.rel, depth + 1);
      else if (entry.kind === type && wanted(fileNameFromPath(entry.name))) {
        found.push(joinRelative(project.root, entry.rel));
      }
    }
  };
  try {
    await walk("", 0);
  } catch {
    // A project that was moved or deleted has no files to find.
  }
  return found;
}
