import { useCallback, useMemo } from "react";

import {
  CURRENT_FORMAT_VERSION,
  fileNameFromPath,
  joinRelative,
  type FileInfo,
  type ProjectEntry,
} from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { folderOfFile } from "@pages/shared/files";
import { normalizePath } from "./project-rel";

/** How many files "Recently edited" shows. */
const RECENT_COUNT = 3;

/**
 * What the recent files know about the project's files. A file opened before has its entry (with
 * its preview picture); one never opened gets a stand-in built from the folder listing.
 */
export function useProjectRecents(root: string) {
  const files = useRecentFilesStore((s) => s.files);
  const missing = useRecentFilesStore((s) => s.missing);

  const byPath = useMemo(() => new Map(files.map((f) => [normalizePath(f.path), f])), [files]);

  const infoFor = useCallback(
    (entry: ProjectEntry): FileInfo => {
      const path = joinRelative(root, entry.rel);
      const known = byPath.get(normalizePath(path));
      if (known) return known;
      const when = entry.updatedAt ?? new Date(0).toISOString();
      return {
        id: `project:${path}`,
        name: fileNameFromPath(entry.name),
        type: entry.kind === "board" ? "board" : "design",
        path,
        createdAt: when,
        updatedAt: when,
        formatVersion: CURRENT_FORMAT_VERSION,
      };
    },
    [root, byPath],
  );

  const recent = useMemo(
    () =>
      files
        .filter((f) => !missing.has(f.id) && folderOfFile(root, f.path) !== null)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, RECENT_COUNT),
    [files, missing, root],
  );

  return { infoFor, recent };
}
