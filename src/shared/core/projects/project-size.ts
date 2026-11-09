import { projectPaths } from "./project-paths";
import type { ProjectFs } from "./project-fs.types";
import type { ProjectSizes } from "./project-size.types";

async function sizeIfThere(fs: ProjectFs, path: string, signal?: AbortSignal): Promise<number> {
  return (await fs.exists(path)) ? fs.size(path, signal) : 0;
}

/**
 * How much room a project takes, split into its files (everything outside `.cloudy`), the assets
 * of its libraries and its trash. An aborted `signal` stops the walk (it throws).
 */
export async function measureProject(
  fs: ProjectFs,
  root: string,
  signal?: AbortSignal,
): Promise<ProjectSizes> {
  const paths = projectPaths(root);
  const [whole, data, libraries, trash, entries] = await Promise.all([
    fs.size(root, signal),
    sizeIfThere(fs, paths.data, signal),
    sizeIfThere(fs, paths.libraries, signal),
    sizeIfThere(fs, paths.trash, signal),
    fs.listTrash(root),
  ]);
  const files = Math.max(0, whole - data);
  return { files, libraries, trash, total: files + libraries + trash, trashItems: entries.length };
}
