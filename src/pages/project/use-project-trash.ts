import { useEffect, useMemo, useState } from "react";

import { projectFs } from "@platform";
import type { TrashEntry } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import type { ProjectTrash } from "./use-project-trash.types";
import { t } from "./project.i18n";

/** The project's trash, read again whenever `rev` changes (files moved, deleted or restored). */
export function useProjectTrash(root: string, rev: number): ProjectTrash {
  const [read, setRead] = useState<{ root: string; entries: TrashEntry[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    projectFs.listTrash(root).then(
      (found) => {
        if (!cancelled) setRead({ root, entries: found });
      },
      (error: unknown) => {
        if (!cancelled) notifyError(t("trash.readFailed"), error);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, rev]);

  return useMemo(() => {
    const entries = read?.root === root ? [...read.entries].reverse() : [];
    return { entries, count: entries.length, size: entries.reduce((sum, e) => sum + e.size, 0) };
  }, [read, root]);
}
