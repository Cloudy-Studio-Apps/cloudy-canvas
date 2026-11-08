import { useCallback, useEffect, useRef, useState } from "react";

import { projectFs } from "@platform";
import {
  isReservedName,
  PROJECT_EXTENSION,
  projectPaths,
  serializeManifest,
  type ProjectManifest,
} from "@shared/core";
import { useProjectsStore } from "@shared/stores/projects-store";
import type { UseProject } from "./use-project.types";
import { t } from "./project.i18n";

/** A project's registry record and manifest, with the writes that change the manifest. */
export function useProject(id: string): UseProject {
  const record = useProjectsStore((s) => s.projects.find((p) => p.id === id)) ?? null;
  const missingIds = useProjectsStore((s) => s.missing);
  const refresh = useProjectsStore((s) => s.refresh);
  const [listed, setListed] = useState(false);
  const [manifest, setManifest] = useState<ProjectManifest | null>(null);
  const [rev, setRev] = useState(0);
  const latest = useRef<ProjectManifest | null>(null);
  const root = record?.root ?? null;

  useEffect(() => {
    void refresh().then(() => setListed(true));
  }, [refresh, id]);

  /** Takes a manifest just read from disk as the current one. */
  const adopt = useCallback((read: ProjectManifest | null) => {
    latest.current = read;
    setManifest(read);
    setRev((n) => n + 1);
  }, []);

  const reload = useCallback(async () => {
    if (root) adopt(await projectFs.readManifest(root, id));
  }, [root, id, adopt]);

  useEffect(() => {
    if (!root) return;
    let cancelled = false;
    void projectFs.readManifest(root, id).then((read) => {
      if (!cancelled) adopt(read);
    });
    return () => {
      cancelled = true;
    };
  }, [root, id, adopt]);

  const write = useCallback(
    async (next: ProjectManifest) => {
      if (!root || !latest.current) return;
      const previous = latest.current;
      latest.current = next;
      try {
        await projectFs.writeTextAtomic(
          projectPaths(root).manifest(next.name),
          serializeManifest(next),
        );
      } catch (error) {
        latest.current = previous;
        throw error;
      }
      setManifest(next);
      setRev((n) => n + 1);
      await useProjectsStore.getState().open(root);
    },
    [root],
  );

  const saveManifest = useCallback(
    async (patch: Partial<ProjectManifest>) => {
      if (latest.current) await write({ ...latest.current, ...patch });
    },
    [write],
  );

  const renameProject = useCallback(
    async (raw: string) => {
      const name = raw.trim();
      const current = latest.current;
      if (!root || !current || name === current.name) return;
      if (isReservedName(name)) throw new Error(t("rename.invalid"));
      const paths = projectPaths(root);
      if (await projectFs.exists(paths.manifest(name))) throw new Error(t("rename.taken"));
      await projectFs.rename(
        root,
        `${current.name}.${PROJECT_EXTENSION}`,
        `${name}.${PROJECT_EXTENSION}`,
      );
      await write({ ...current, name });
    },
    [root, write],
  );

  const status =
    !listed && !record
      ? "loading"
      : !record
        ? "notFound"
        : missingIds.has(id)
          ? "missing"
          : manifest
            ? "ready"
            : "loading";
  return { status, record, manifest, rev, reload, saveManifest, renameProject };
}
