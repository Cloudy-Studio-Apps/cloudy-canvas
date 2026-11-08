import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "react-router";

import {
  heldLibraries,
  librariesUsedBy,
  type CanvasEngine,
  type LibraryDocument,
  type ProjectLink,
} from "@canvas";
import { projectsSupported } from "@platform";
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
 * project isn't found, its library items can't be edited (`useLibraryGuard`). Where projects
 * aren't supported it does nothing (`none`: library items read-only).
 */
export function useProjectLibraries<O extends object>(
  engine: CanvasEngine<O>,
  file: CanvasFileContextValue,
): ProjectLibrariesState {
  const { doc } = engine;
  const [params] = useSearchParams();
  const [newProject] = useState(() => (file.isNew ? params.get("project") : null));
  // The libraries a new file uses when it shouldn't take all (`libraries=<id>,<id>`).
  const [newLibraries] = useState(() => (file.isNew ? params.get("libraries") : null));
  const path = useRef(file.path);
  useEffect(() => {
    path.current = file.path;
  }, [file.path]);

  useEffect(() => {
    if (newProject && !doc.projectLink()) {
      const libraryIds = newLibraries ? newLibraries.split(",").filter(Boolean) : "all";
      doc.setProjectLink({ projectId: newProject, libraryIds });
    }
  }, [doc, newProject, newLibraries]);

  const subscribe = useCallback((listener: () => void) => doc.observeProjectLink(listener), [doc]);
  const linked = useSyncExternalStore(subscribe, () => doc.projectLink()?.projectId ?? null);
  const used = useSyncExternalStore(subscribe, () =>
    JSON.stringify(doc.projectLink()?.libraryIds ?? null),
  );
  // Where projects don't exist (Android, the browser build) a file's project is never looked
  // for: its library items stay read-only, with no hub and no "project not found".
  const projectId = projectsSupported() ? (linked ?? newProject) : null;
  // The libraries the file holds items of: an `"all"` link keeps using them (`librariesUsedBy`).
  const subscribeTokens = useCallback(
    (listener: () => void) => doc.observeTokens(() => listener()),
    [doc],
  );
  const held = useSyncExternalStore(subscribeTokens, () =>
    [...heldLibraries(doc)].sort().join("\n"),
  );

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
        if (record.id !== projectId) {
          // The file is in a copy of the project made its own: it follows the copy now (the
          // link's change runs this again with the copy's id; the recent file follows the link).
          const libraryIds = doc.projectLink()?.libraryIds ?? "all";
          doc.setProjectLink({ projectId: record.id, libraryIds });
          return;
        }
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
  }, [doc, projectId, request]);

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
        ? librariesUsedBy({ projectId, libraryIds }, hub.entries(), new Set(held.split("\n")))
        : [];
    const libraries = ids.flatMap((id): LibraryDocument[] => {
      const library = hub?.library(id);
      return library ? [library] : [];
    });
    return { status, projectId, project, hub, libraries, locate };
  }, [used, held, hub, status, projectId, project, locate]);
}
