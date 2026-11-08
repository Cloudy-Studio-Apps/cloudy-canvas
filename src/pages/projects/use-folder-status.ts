import { useEffect, useState } from "react";

import { projectFs } from "@platform";
import type { FolderStatus } from "./use-folder-status.types";

/** Whether `folder` is missing, already there or a project already; `null` while it's checked. */
export function useFolderStatus(folder: string | null): FolderStatus | null {
  // Keyed by folder, so an answer for the previous one never shows for the next.
  const [checked, setChecked] = useState<{ folder: string; status: FolderStatus } | null>(null);

  useEffect(() => {
    if (!folder) return;
    let cancelled = false;
    const check = async (): Promise<FolderStatus> => {
      if (!(await projectFs.exists(folder))) return "new";
      return (await projectFs.readManifestFile(folder)) ? "project" : "existing";
    };
    void check().then(
      (status) => {
        if (!cancelled) setChecked({ folder, status });
      },
      // Unreadable: treat it as there already; creating it says what's wrong.
      () => {
        if (!cancelled) setChecked({ folder, status: "existing" });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [folder]);

  return folder !== null && checked?.folder === folder ? checked.status : null;
}
