import { projectFs, projectRegistry, projectsSupported } from "@platform";
import { fileNameFromPath, joinRelative, type FileType, type ProjectRecord } from "@shared/core";

/** How deep inside a project's folders agents look for a file by name. */
const MAX_DEPTH = 6;
/** How long a project's file list is reused (agents often open several files in a row). */
const CACHE_MS = 10_000;

/** A board or design inside a project: its name without the extension, and its path. */
interface ProjectFile {
  name: string;
  type: FileType;
  path: string;
}

const cache = new Map<string, { at: number; files: Promise<ProjectFile[]> }>();

/** The projects this device knows (none where projects aren't supported). */
export async function knownProjects(): Promise<ProjectRecord[]> {
  return projectsSupported() ? projectRegistry.list() : [];
}

/**
 * The paths of a project's files of one type whose name (without extension) passes `wanted`.
 * The list is read with the project page's scanner (`projectFs.scan`, each level's folders in
 * parallel, hidden folders and `node_modules` skipped) and kept for 10 seconds. A project whose
 * folder can't be read has none.
 */
export async function projectFilesNamed(
  project: ProjectRecord,
  type: FileType,
  wanted: (name: string) => boolean,
): Promise<string[]> {
  const files = await listProjectFiles(project);
  return files.filter((f) => f.type === type && wanted(f.name)).map((f) => f.path);
}

function listProjectFiles(project: ProjectRecord): Promise<ProjectFile[]> {
  const kept = cache.get(project.root);
  if (kept && Date.now() - kept.at < CACHE_MS) return kept.files;
  const entry = { at: Date.now(), files: Promise.resolve<ProjectFile[]>([]) };
  entry.files = scanProject(project).catch(() => {
    // A failed scan isn't kept: the next lookup reads the folder again.
    if (cache.get(project.root) === entry) cache.delete(project.root);
    return [];
  });
  cache.set(project.root, entry);
  return entry.files;
}

async function scanProject(project: ProjectRecord): Promise<ProjectFile[]> {
  const walk = async (rel: string, depth: number): Promise<ProjectFile[]> => {
    const entries = await projectFs.scan(project.root, rel === "" ? undefined : rel);
    const found: ProjectFile[] = [];
    const folders: Promise<ProjectFile[]>[] = [];
    for (const entry of entries) {
      if (entry.kind === "folder") {
        const skip = entry.name.startsWith(".") || entry.name === "node_modules";
        if (!skip && depth < MAX_DEPTH) folders.push(walk(entry.rel, depth + 1));
      } else if (entry.kind === "board" || entry.kind === "design") {
        found.push({
          name: fileNameFromPath(entry.name),
          type: entry.kind,
          path: joinRelative(project.root, entry.rel),
        });
      }
    }
    return [...found, ...(await Promise.all(folders)).flat()];
  };
  return walk("", 0);
}
