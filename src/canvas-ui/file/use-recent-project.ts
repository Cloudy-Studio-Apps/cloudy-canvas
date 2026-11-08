import { useEffect } from "react";

import type { CanvasEngine } from "@canvas";
import type { FileInfo } from "@shared/core";
import { storage } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError } from "@shared/stores/toast-store";
import { t } from "./file.i18n";

/**
 * Keeps a saved file's recent-files entry on the project of its link (`doc.projectLink()`) from
 * the moment it opens and whenever the link changes, not only when it's saved next.
 */
export function useRecentProject<O extends object>(
  id: string,
  engine: CanvasEngine<O>,
  info: FileInfo | null,
): void {
  const saved = info !== null && !info.draft;
  const recorded = info?.projectId ?? null;
  useEffect(() => {
    if (!saved) return;
    let last = recorded;
    const record = () => {
      const projectId = engine.doc.projectLink()?.projectId ?? null;
      if (projectId === last) return;
      last = projectId;
      storage.setProject(id, projectId).then(
        (file) => file && useRecentFilesStore.getState().upsert(file),
        (error: unknown) => notifyError(t("recents.projectFailed"), error),
      );
    };
    record();
    return engine.doc.observeProjectLink(record);
  }, [engine, id, saved, recorded]);
}
