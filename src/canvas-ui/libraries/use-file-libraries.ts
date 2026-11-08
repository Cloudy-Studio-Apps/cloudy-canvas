import { useEffect, useReducer } from "react";

import { detachLibrary, heldLibraries, librariesUsedBy, libraryUsers } from "@canvas";
import { useEngine } from "../engine-context";
import { notifyError } from "@shared/stores/toast-store";
import { useProjectLibrariesState } from "./project-libraries-context";
import type { FileLibraries } from "./file-libraries.types";
import { t } from "./libraries.i18n";

/**
 * The project's libraries for the file's libraries menu, which of them the file uses, and turning
 * one on or off. The first change writes an explicit list into the file's link (a new file uses
 * `"all"`, the libraries new files take). Each change is one undo step with the link in it:
 * turning one on mirrors it in, and turning one off takes its items out of the file, unlinked
 * from the layers using them (`detachLibrary`); undoing either puts the link back and the next
 * mirror settles the records.
 */
export function useFileLibraries(): FileLibraries {
  const { doc } = useEngine();
  const { status, hub, project } = useProjectLibrariesState();
  // Library names and the manifest's list change without the file changing.
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  useEffect(() => hub?.onChange(refresh), [hub]);

  const entries = [...(hub?.entries() ?? [])].sort((a, b) =>
    a.order < b.order ? -1 : a.order > b.order ? 1 : 0,
  );
  const link = doc.projectLink();
  const used = new Set(link ? librariesUsedBy(link, entries, heldLibraries(doc)) : []);
  const unreadable = hub?.unreadable() ?? new Set<string>();

  const setUsed = (libraryId: string, on: boolean) => {
    if (!link) return;
    const libraryIds = entries
      .filter((entry) => (entry.id === libraryId ? on : used.has(entry.id)))
      .map((entry) => entry.id);
    doc.checkpoint();
    const release = doc.holdCheckpoints();
    try {
      // The link first, as part of the undo step: the library sync then no longer writes this
      // library's records anywhere, and undoing brings the link back with them.
      doc.setProjectLink({ projectId: link.projectId, libraryIds }, { undoable: true });
      if (!on) detachLibrary(doc, libraryId);
    } catch (error) {
      notifyError(t("libraries.changeFailed"), error);
    } finally {
      release();
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
