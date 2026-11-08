import { useCallback, useEffect, useState } from "react";

import { projectFs } from "@platform";
import { notifyError } from "@shared/stores/toast-store";
import type { FolderScan } from "./use-folder-scan.types";
import { t } from "./project.i18n";

/**
 * One level of a project's folder (`rel`, `""` for the root), read again when `rev` changes or
 * `refresh()` is called. Only folders and boards/designs are kept.
 */
export function useFolderScan(root: string, rel: string, rev = 0, enabled = true): FolderScan {
  const key = `${root}\0${rel}`;
  const [read, setRead] = useState<{ key: string; entries: FolderScan["entries"] } | null>(null);
  const [local, setLocal] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    projectFs.scan(root, rel === "" ? undefined : rel).then(
      (found) => {
        if (!cancelled) setRead({ key, entries: found.filter((e) => e.kind !== "other") });
      },
      (error: unknown) => {
        if (cancelled) return;
        setRead({ key, entries: [] });
        notifyError(t("scanFailed"), error);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, rel, key, rev, local, enabled]);

  const refresh = useCallback(() => setLocal((n) => n + 1), []);
  const current = read?.key === key ? read.entries : null;
  return { entries: current ?? [], loading: enabled && current === null, refresh };
}
