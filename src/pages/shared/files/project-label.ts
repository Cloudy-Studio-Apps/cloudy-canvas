import type { FileInfo, ProjectRecord } from "@shared/core";
import { folderOfFile } from "./folder-of-file";

/**
 * Where a file is, for Home: "Project › Posts / 2026" from its `projectId` and the project's
 * folder; just the project's name for a file in its root or outside its folder; `null` for a file
 * in no project (or one this device doesn't know).
 */
export function projectLabel(
  file: Pick<FileInfo, "projectId" | "path">,
  projects: readonly ProjectRecord[],
): string | null {
  if (!file.projectId) return null;
  const project = projects.find((p) => p.id === file.projectId);
  if (!project) return null;
  const folder = folderOfFile(project.root, file.path);
  return folder ? `${project.name} › ${folder.split("/").join(" / ")}` : project.name;
}
