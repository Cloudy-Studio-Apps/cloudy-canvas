import { useEffect, useReducer } from "react";

import { detachLibrary, librariesUsedBy, libraryUsers } from "@canvas";
import { useProjectLibrariesState } from "@canvas-ui";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { notifyError } from "@shared/stores/toast-store";
import type { FileLibraries } from "./variables-ui.types";
import { t } from "../variables.i18n";

/**
 * The project's libraries for the file's libraries menu, which of them the file uses, and turning
 * one on or off. The first change writes an explicit list into the file's link (a new file uses
 * `"all"`, the libraries new files take); turning one on mirrors it in, and turning one off takes
 * its items out of the file, unlinked from the layers using them (`detachLibrary`, one undo step).
 */
export function useFileLibraries(): FileLibraries {
  const { doc } = useDesignEngine();
  const { status, hub, project } = useProjectLibrariesState();
  // Library names and the manifest's list change without the file changing.
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => hub?.onChange(refresh), [hub]);

  const entries = [...(hub?.entries() ?? [])].sort((a, b) =>
    a.order < b.order ? -1 : a.order > b.order ? 1 : 0,
  );
  const link = doc.projectLink();
  const used = new Set(link ? librariesUsedBy(link, entries) : []);
  const unreadable = hub?.unreadable() ?? new Set<string>();

  const setUsed = (libraryId: string, on: boolean) => {
    if (!link) return;
    try {
      const libraryIds = entries
        .filter((entry) => (entry.id === libraryId ? on : used.has(entry.id)))
        .map((entry) => entry.id);
      // The link first: the library sync then no longer writes this library's records anywhere.
      doc.setProjectLink({ projectId: link.projectId, libraryIds });
      if (!on) detachLibrary(doc, libraryId);
    } catch (error) {
      notifyError(t("libraries.changeFailed"), error);
    }
  };

  return {
    ready: status === "ready",
    projectName: project?.name ?? "",
    entries,
    used,
    unreadable,
    users: (libraryId) => libraryUsers(doc, libraryId).size,
    setUsed,
  };
}
