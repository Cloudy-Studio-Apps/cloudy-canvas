import { projectPaths } from "./project-paths";
import type { ProjectFs } from "./project-fs.types";
import type { ProjectSizes } from "./project-size.types";

async function sizeIfThere(fs: ProjectFs, path: string): Promise<number> {
  return (await fs.exists(path)) ? fs.size(path) : 0;
}

/**
 * How much room a project takes, split into its files (everything outside `.cloudy`), the assets
 * of its libraries and its trash.
 */
export async function measureProject(fs: ProjectFs, root: string): Promise<ProjectSizes> {
  const paths = projectPaths(root);
  const [whole, data, libraries, trash, entries] = await Promise.all([
    fs.size(root),
    sizeIfThere(fs, paths.data),
    sizeIfThere(fs, paths.libraries),
    sizeIfThere(fs, paths.trash),
    fs.listTrash(root),
  ]);
  const files = Math.max(0, whole - data);
  return { files, libraries, trash, total: files + libraries + trash, trashItems: entries.length };
}
