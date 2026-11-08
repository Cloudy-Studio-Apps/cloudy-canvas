import { projectFs } from "@platform";
import {
  baseNameFromPath,
  FILE_EXTENSIONS,
  isReservedName,
  joinRelative,
  uniqueName,
  type FileInfo,
} from "@shared/core";
import { folderOfFile } from "@pages/shared/files";

/**
 * Where a file added to the project at `root` is written: its own path when it's in `folder`
 * already, else its name in `folder`, numbered when taken (a draft is named after its title, or
 * `untitled` when that can't be a file name).
 */
export async function targetPath(
  root: string,
  folder: string,
  file: FileInfo,
  untitled: string,
): Promise<string> {
  if (!file.draft && folderOfFile(root, file.path) === folder) return file.path;
  const ext = FILE_EXTENSIONS[file.type];
  const stem = file.name.replace(/[<>:"/\\|?*]/g, "-").trim();
  const name = file.draft
    ? `${isReservedName(stem) ? untitled : stem}.${ext}`
    : baseNameFromPath(file.path);
  const taken = new Set((await projectFs.scan(root, folder)).map((entry) => entry.name));
  return joinRelative(joinRelative(root, folder), uniqueName(name, taken));
}
