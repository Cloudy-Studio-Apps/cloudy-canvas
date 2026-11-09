import { useCallback, useEffect, useMemo, useState } from "react";

import { LibraryHub } from "@canvas-ui";
import type { ProjectRecord } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import { summarizeLibrary } from "./library-summary";
import type { ProjectLibraryDocs } from "./use-project-library-docs.types";
import { t } from "../project.i18n";

/**
 * Opens the project's `LibraryHub` while the project home is shown (read-write, released when it
 * goes) and keeps a summary of each library, read again whenever any of them changes.
 */
export function useProjectLibraryDocs(record: ProjectRecord): ProjectLibraryDocs {
  const [hub, setHub] = useState<LibraryHub | null>(null);
  const [rev, setRev] = useState(0);
  const { id, root } = record;

  useEffect(() => {
    let cancelled = false;
    let off = () => {};
    let release: (() => Promise<void>) | null = null;
    LibraryHub.open(record).then(
      (opened) => {
        if (cancelled) {
          void opened.release();
          return;
        }
        release = opened.release;
        off = opened.hub.onChange(() => setRev((n) => n + 1));
        setHub(opened.hub);
      },
      (error: unknown) => {
        if (!cancelled) notifyError(t("libraries.openFailed"), error);
      },
    );
    return () => {
      cancelled = true;
      off();
      setHub(null);
      void release?.();
    };
    // The hub is the project's by id and folder; a record that only changed its name keeps it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, root]);

  const summaries = useMemo(() => {
    void rev;
    if (!hub) return [];
    return hub.entries().flatMap((entry) => {
      const doc = hub.library(entry.id);
      return doc ? [summarizeLibrary(entry, doc)] : [];
    });
  }, [hub, rev]);

  const reload = useCallback(async () => {
    if (!hub) return;
    await hub.refresh();
    setRev((n) => n + 1);
  }, [hub]);

  return { hub, summaries, loading: hub === null, reload };
}
