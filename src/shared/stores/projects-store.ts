import { create } from "zustand";

import { pickFolder, projectFs, projectRegistry } from "@platform";
import type { ProjectManifest, ProjectRecord } from "@shared/core";
import type { ProjectsState } from "./projects-store.types";
import { notifyError } from "./toast-store";
import { t } from "./stores.i18n";

const NONE: ReadonlySet<string> = new Set();

/** The registry record for the project a manifest describes, keeping what the registry knew. */
function recordFor(
  root: string,
  manifest: ProjectManifest,
  previous: ProjectRecord | null,
): ProjectRecord {
  return {
    id: manifest.id,
    name: manifest.name,
    root,
    color: manifest.color,
    pinned: previous?.pinned ?? false,
    openedAt: new Date().toISOString(),
  };
}

export const useProjectsStore = create<ProjectsState>()((set) => {
  /** Saves a record and shows it in the store. */
  const store = async (record: ProjectRecord): Promise<ProjectRecord> => {
    await projectRegistry.put(record);
    set((state) => ({
      projects: state.projects.some((p) => p.id === record.id)
        ? state.projects.map((p) => (p.id === record.id ? record : p))
        : [record, ...state.projects],
      missing: withoutId(state.missing, record.id),
    }));
    return record;
  };

  return {
    projects: [],
    missing: NONE,
    refresh: async () => {
      try {
        const projects = await projectRegistry.list();
        const found = await Promise.all(
          projects.map(async (p) => (await projectFs.readManifest(p.root))?.id === p.id),
        );
        const missing = new Set(projects.filter((_, i) => !found[i]).map((p) => p.id));
        set({ projects, missing: missing.size > 0 ? missing : NONE });
      } catch (error) {
        notifyError(t("projects.readFailed"), error);
      }
    },
    open: async (root) => {
      const manifest = await projectFs.readManifest(root);
      if (!manifest) throw new Error(`No project found in ${root}`);
      return store(recordFor(root, manifest, await projectRegistry.get(manifest.id)));
    },
    locate: async (id) => {
      const root = await pickFolder(t("projects.locateTitle"));
      if (!root) return null;
      const manifest = await projectFs.readManifest(root);
      if (manifest?.id !== id) throw new Error(t("projects.notThisProject"));
      return store(recordFor(root, manifest, await projectRegistry.get(id)));
    },
    setPinned: async (id, pinned) => {
      try {
        const record = await projectRegistry.get(id);
        if (record) await store({ ...record, pinned });
      } catch (error) {
        notifyError(t("projects.updateFailed"), error);
      }
    },
    forget: async (id) => {
      try {
        await projectRegistry.remove(id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          missing: withoutId(state.missing, id),
        }));
      } catch (error) {
        notifyError(t("projects.removeFailed"), error);
      }
    },
    resolve: async (id, nearFile) => {
      const record = await projectRegistry.get(id);
      if (!record) return null;
      if ((await projectFs.readManifest(record.root))?.id === id) return record;
      if (!nearFile) return null;
      const root = await projectFs.findManifestAbove(nearFile, id);
      const manifest = root ? await projectFs.readManifest(root) : null;
      if (!root || manifest?.id !== id) return null;
      return store({ ...recordFor(root, manifest, record), openedAt: record.openedAt });
    },
  };
});

function withoutId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!ids.has(id)) return ids;
  const next = new Set(ids);
  next.delete(id);
  return next;
}
