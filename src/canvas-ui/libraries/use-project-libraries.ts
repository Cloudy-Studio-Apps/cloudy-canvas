import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router";

import {
  librariesUsedBy,
  type CanvasEngine,
  type LibraryDocument,
  type ProjectLink,
} from "@canvas";
import { useProjectsStore } from "@shared/stores/projects-store";
import { notifyError } from "@shared/stores/toast-store";
import type { CanvasFileContextValue } from "../file";
import { LibraryHub } from "./library-hub";
import { useLibraryGuard } from "./use-library-guard";
import { useLibrarySync } from "./use-library-sync";
import type { FoundProject, ProjectLibrariesState } from "./use-project-libraries.types";
import { t } from "./libraries.i18n";

/**
 * Connects a saved file's editor to its project's libraries (never a live guest's): finds the
 * project in the file's link (a new file made in a project gets its `?project=` link), opens the
 * project's `LibraryHub` and keeps the file and the libraries in sync (`useLibrarySync`); when the
 * project isn't found, its library items can't be edited (`useLibraryGuard`).
 */
export function useProjectLibraries<O extends object>(
  engine: CanvasEngine<O>,
  file: CanvasFileContextValue,
): ProjectLibrariesState {
  const { doc } = engine;
  const [params] = useSearchParams();
  const [newProject] = useState(() => (file.isNew ? params.get("project") : null));
  const path = useRef(file.path);
  useEffect(() => {
    path.current = file.path;
  }, [file.path]);

  useEffect(() => {
    if (newProject && !doc.projectLink()) {
      doc.setProjectLink({ projectId: newProject, libraryIds: "all" });
    }
  }, [doc, newProject]);

  const subscribe = useCallback((listener: () => void) => doc.observeProjectLink(listener), [doc]);
  const linked = useSyncExternalStore(subscribe, () => doc.projectLink()?.projectId ?? null);
  const used = useSyncExternalStore(subscribe, () =>
    JSON.stringify(doc.projectLink()?.libraryIds ?? null),
  );
  const projectId = linked ?? newProject;

  const [attempt, setAttempt] = useState(0);
  const request = `${projectId}:${attempt}`;
  const [found, setFound] = useState<FoundProject | null>(null);
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    let release: (() => Promise<void>) | null = null;
    const missing: FoundProject = { request, status: "missing", project: null, hub: null };
    void (async () => {
      try {
        const record = await useProjectsStore
          .getState()
          .resolve(projectId, path.current ?? undefined);
        if (cancelled) return;
        if (!record) return setFound(missing);
        const opened = await LibraryHub.open(record);
        if (cancelled) return void opened.release();
        release = opened.release;
        setFound({ request, status: "ready", project: record, hub: opened.hub });
      } catch (error) {
        notifyError(t("hub.openFailed"), error);
        if (!cancelled) setFound(missing);
      }
    })();
    return () => {
      cancelled = true;
      void release?.();
    };
  }, [projectId, request]);

  const current = projectId && found?.request === request ? found : null;
  const status = !projectId ? "none" : (current?.status ?? "loading");
  const hub = current?.hub ?? null;
  useLibrarySync(engine, hub);
  useLibraryGuard(doc, status === "missing");

  const locate = useCallback(async () => {
    if (!projectId) return;
    try {
      if (await useProjectsStore.getState().locate(projectId)) setAttempt((n) => n + 1);
    } catch (error) {
      notifyError(t("missing.locateFailed"), error);
    }
  }, [projectId]);

  const project = current?.project ?? null;
  return useMemo(() => {
    const libraryIds = JSON.parse(used) as ProjectLink["libraryIds"] | null;
    const ids =
      hub && projectId && libraryIds
        ? librariesUsedBy({ projectId, libraryIds }, hub.entries())
        : [];
    const libraries = ids.flatMap((id): LibraryDocument[] => {
      const library = hub?.library(id);
      return library ? [library] : [];
    });
    return { status, projectId, project, hub, libraries, locate };
  }, [used, hub, status, projectId, project, locate]);
}
