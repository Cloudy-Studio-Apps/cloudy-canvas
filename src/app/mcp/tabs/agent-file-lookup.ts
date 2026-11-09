import { storage } from "@platform";
import { fileNameFromPath, samePath, type FileType } from "@shared/core";
import { sameFileName, type AgentFileMatch } from "@canvas";
import { knownProjects, projectFilesNamed } from "./agent-project-files";
import type { FileHit } from "./agent-file-lookup.types";

/**
 * The files of one type a name could mean: the recent files that exist, then the files inside the
 * user's projects (see `projectFilesNamed`) that aren't recent already. The name matches
 * case-insensitively, whole, without the extension.
 */
export async function findFilesByName(type: FileType, name: string): Promise<FileHit[]> {
  const projects = await knownProjects();
  const projectName = (id: string | undefined) => projects.find((p) => p.id === id)?.name ?? null;
  const hits: FileHit[] = [];

  const recent = (await storage.list()).filter(
    (file) =>
      file.type === type && (sameFileName(file.name, name) || sameFileName(file.title ?? "", name)),
  );
  const present = await Promise.all(recent.map((file) => storage.exists(file.id)));
  recent.forEach((file, i) => {
    if (!present[i]) return;
    hits.push({
      id: file.id,
      match: { name: file.name, type, project: projectName(file.projectId), path: file.path },
    });
  });

  for (const project of projects) {
    for (const path of await projectFilesNamed(project, type, (n) => sameFileName(n, name))) {
      if (hits.some((hit) => samePath(hit.match.path, path))) continue;
      const match: AgentFileMatch = {
        name: fileNameFromPath(path),
        type,
        project: project.name,
        path,
      };
      hits.push({ id: null, match });
    }
  }
  return hits;
}

/** What was searched, for the error of a name that matches nothing. */
export async function searchedPlaces(): Promise<string> {
  const count = (await knownProjects()).length;
  return count === 0
    ? "the recent files"
    : `the recent files and the files of ${count} project${count === 1 ? "" : "s"}`;
}
