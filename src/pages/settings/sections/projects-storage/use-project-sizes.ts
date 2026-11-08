import { useCallback, useEffect, useState } from "react";

import { projectFs } from "@platform";
import { measureProject, type ProjectRecord, type ProjectSizes } from "@shared/core";
import type { ProjectSizesState } from "./projects-storage.types";

/**
 * The sizes of `projects`, measured after the first paint (a big project takes a while) one after
 * another; a project that can't be read just has no size.
 */
export function useProjectSizes(
  projects: ProjectRecord[],
  missing: ReadonlySet<string>,
): ProjectSizesState {
  const [sizes, setSizes] = useState<ReadonlyMap<string, ProjectSizes>>(new Map());
  const [rev, setRev] = useState<{ id: string | null; n: number }>({ id: null, n: 0 });
  const key = projects.map((p) => `${p.id}\0${p.root}`).join("\n");

  useEffect(() => {
    let cancelled = false;
    const wanted = projects.filter(
      (p) => !missing.has(p.id) && (rev.id === null || rev.id === p.id),
    );
    void (async () => {
      for (const project of wanted) {
        try {
          const measured = await measureProject(projectFs, project.root);
          if (cancelled) return;
          setSizes((previous) => new Map(previous).set(project.id, measured));
        } catch {
          // Unreadable right now: the row shows no size.
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // `key` stands for the projects' ids and folders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, missing, rev]);

  const reload = useCallback((id?: string) => setRev((r) => ({ id: id ?? null, n: r.n + 1 })), []);
  return { sizes, reload };
}
