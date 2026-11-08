import { useEffect, useState } from "react";

import { projectFs } from "@platform";
import type { ProjectEntry } from "@shared/core";

/** How deep a search looks into folders. */
const MAX_DEPTH = 8;

async function collect(
  root: string,
  rel: string,
  needle: string,
  depth: number,
  into: ProjectEntry[],
): Promise<void> {
  const entries = await projectFs.scan(root, rel === "" ? undefined : rel);
  for (const entry of entries) {
    if (entry.kind === "other") continue;
    if (entry.name.toLowerCase().includes(needle)) into.push(entry);
    if (entry.kind === "folder" && depth < MAX_DEPTH) {
      await collect(root, entry.rel, needle, depth + 1, into);
    }
  }
}

/** The files and folders in `folder` and below whose names contain `query` (nothing when empty). */
export function useFolderSearch(root: string, folder: string, query: string, rev: number) {
  const [results, setResults] = useState<ProjectEntry[]>([]);
  const needle = query.trim().toLowerCase();

  useEffect(() => {
    if (needle === "") return;
    let cancelled = false;
    const found: ProjectEntry[] = [];
    collect(root, folder, needle, 0, found).then(
      () => {
        if (!cancelled) setResults(found);
      },
      () => {
        if (!cancelled) setResults([]);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, folder, needle, rev]);

  return needle === "" ? null : results;
}
