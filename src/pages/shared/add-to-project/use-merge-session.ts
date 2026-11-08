import { useEffect, useState } from "react";

import type { FileInfo, ProjectRecord } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import type { MergeSessionState, OpenedSession } from "./use-merge-session.types";
import { t } from "./add-to-project.i18n";

/**
 * Opens `file` and `project`'s libraries outside any editor (`MergeSession`, loaded on first use)
 * while both are given, and closes them when either changes or the dialog goes.
 */
export function useMergeSession(
  file: FileInfo | null,
  project: ProjectRecord | null,
): MergeSessionState {
  const [opened, setOpened] = useState<OpenedSession | null>(null);

  useEffect(() => {
    if (!file || !project) return;
    let cancelled = false;
    const opening = import("./merge-session").then(({ MergeSession }) =>
      MergeSession.open(file, project),
    );
    opening.then(
      (session) => {
        if (cancelled) void session.close();
        else setOpened({ file, project, session });
      },
      (error: unknown) => {
        if (cancelled) return;
        notifyError(t("dialog.readFailed"), error);
        setOpened({ file, project, session: null });
      },
    );
    return () => {
      cancelled = true;
      void opening.then((session) => session.close()).catch(() => undefined);
    };
  }, [file, project]);

  if (!file || !project) return { status: "idle", session: null };
  if (opened?.file !== file || opened.project !== project) {
    return { status: "loading", session: null };
  }
  return opened.session
    ? { status: "ready", session: opened.session }
    : { status: "failed", session: null };
}
