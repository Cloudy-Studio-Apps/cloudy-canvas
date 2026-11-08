import { create } from "zustand";

import { pickFolder, projectFs, projectRegistry } from "@platform";
import {
  createId,
  samePath,
  serializeManifest,
  type ManifestFile,
  type ProjectManifest,
  type ProjectRecord,
} from "@shared/core";
import type { ProjectsState } from "./projects-store.types";
import { notifyError, toast } from "./toast-store";
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

  /**
   * Whether the project in `root` is a copy: its id is registered at another folder that still
   * holds that project.
   */
  const isCopy = async (root: string, previous: ProjectRecord | null): Promise<boolean> =>
    previous !== null &&
    !samePath(previous.root, root) &&
    (await projectFs.readManifest(previous.root, previous.id)) !== null;

  /** Makes the copy in `root` its own project: a new id, the old one kept as `copiedFrom`. */
  const separate = async (root: string, read: ManifestFile): Promise<ProjectRecord> => {
    const manifest: ProjectManifest = {
      ...read.manifest,
      id: createId(),
      copiedFrom: read.manifest.id,
    };
    await projectFs.writeTextAtomic(read.path, serializeManifest(manifest));
    const record = await store(recordFor(root, manifest, null));
    toast({
      title: t("projects.openedAsCopy"),
      description: t("projects.openedAsCopyText", { name: manifest.name }),
    });
    return record;
  };

  return {
    projects: [],
    missing: NONE,
    refresh: async () => {
      try {
        const projects = await projectRegistry.list();
        const found = await Promise.all(
          projects.map(async (p) => (await projectFs.readManifest(p.root, p.id)) !== null),
        );
        const missing = new Set(projects.filter((_, i) => !found[i]).map((p) => p.id));
        set({ projects, missing: missing.size > 0 ? missing : NONE });
      } catch (error) {
        notifyError(t("projects.readFailed"), error);
      }
    },
    open: async (root) => {
      const read = await projectFs.readManifestFile(root);
      if (!read) throw new Error(`No project found in ${root}`);
      const previous = await projectRegistry.get(read.manifest.id);
      if (await isCopy(root, previous)) return separate(root, read);
      return store(recordFor(root, read.manifest, previous));
    },
    locate: async (id) => {
      const root = await pickFolder(t("projects.locateTitle"));
      if (!root) return null;
      const manifest = await projectFs.readManifest(root, id);
      if (!manifest) throw new Error(t("projects.notThisProject"));
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
      // The project above the file wins over the registry's folder: a file of a copied folder
      // belongs to the copy.
      const above = nearFile ? await projectFs.findManifestAbove(nearFile, id) : null;
      if (above) {
        const { root, manifest } = above;
        if (manifest.id !== id) {
          // A copy made its own already (`copiedFrom`): the caller links the file to it.
          const known = await projectRegistry.get(manifest.id);
          if (known && samePath(known.root, root)) return known;
          return store(recordFor(root, manifest, known));
        }
        if (record && samePath(record.root, root)) return record;
        if (await isCopy(root, record)) return separate(root, above);
        const found = recordFor(root, manifest, record);
        return store(record ? { ...found, openedAt: record.openedAt } : found);
      }
      if (record && (await projectFs.readManifest(record.root, id))) return record;
      return null;
    },
  };
});

function withoutId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!ids.has(id)) return ids;
  const next = new Set(ids);
  next.delete(id);
  return next;
}
