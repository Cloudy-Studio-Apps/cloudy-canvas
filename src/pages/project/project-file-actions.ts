import { useMemo } from "react";
import { useNavigate } from "react-router";

import { projectFs, revealFile } from "@platform";
import { createId, extensionOf, joinRelative, type FileType } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { forgetRecents } from "./forget-recents";
import { isInside, joinRel, parentRel, rekeyFolders } from "./project-rel";
import { relocateRecents } from "./relocate-recents";
import type { ProjectActions } from "./project-context.types";
import type { ProjectActionsOptions } from "./project-file-actions.types";
import { t } from "./project.i18n";

/** What can be done with a project's files and folders; failures are shown as toasts. */
export function useProjectActions(options: ProjectActionsOptions): ProjectActions {
  const navigate = useNavigate();
  const { root, projectId, manifest, saveManifest, folder, setFolder, bump, afterRestore } =
    options;

  return useMemo<ProjectActions>(() => {
    const attempt = async (title: string, run: () => Promise<void>) => {
      try {
        await run();
      } catch (error) {
        notifyError(title, error);
      }
    };

    /** A file or folder moved from `from` to `to`: what refers to it follows. */
    const followed = async (from: string, to: string, isFolder: boolean) => {
      // The disk already changed: show it first, whatever happens to what refers to it.
      bump();
      try {
        await relocateRecents(root, from, to);
        if (isFolder) {
          const folders = rekeyFolders(manifest.folders, from, to);
          if (Object.keys(folders).some((k) => !(k in manifest.folders))) {
            await saveManifest({ folders });
          }
          if (isInside(from, folder)) setFolder(to + folder.slice(from.length));
        }
      } catch (error) {
        notifyError(t("actions.followFailed"), error);
      } finally {
        bump();
      }
    };

    return {
      open: (entry) =>
        attempt(t("actions.openFailed"), async () => {
          const file = await useRecentFilesStore.getState().open(joinRelative(root, entry.rel));
          await navigate(`/${file.type}/${file.id}`);
        }),
      createFolder: async (parent) => {
        try {
          const rel = await projectFs.createFolder(root, joinRel(parent, t("folder.newName")));
          bump();
          return rel;
        } catch (error) {
          notifyError(t("actions.createFolderFailed"), error);
          return null;
        }
      },
      rename: (entry, raw) =>
        attempt(t("actions.renameFailed"), async () => {
          const isFolder = entry.kind === "folder";
          const name = raw.trim() + (isFolder ? "" : `.${extensionOf(entry.name)}`);
          if (name === entry.name) return;
          const to = await projectFs.rename(root, entry.rel, name);
          await followed(entry.rel, to, isFolder);
        }),
      move: (rel, toFolder, isFolder) =>
        attempt(t("actions.moveFailed"), async () => {
          // Into the folder it is in already, or into itself: nothing to do.
          if (parentRel(rel) === toFolder || isInside(rel, toFolder)) return;
          const to = await projectFs.move(root, rel, toFolder);
          await followed(rel, to, isFolder);
        }),
      duplicate: (entry) =>
        attempt(t("actions.duplicateFailed"), async () => {
          await projectFs.duplicate(root, entry.rel);
          bump();
        }),
      reveal: (rel) =>
        attempt(t("actions.revealFailed"), () => revealFile(joinRelative(root, rel))),
      trash: (entry) =>
        attempt(t("actions.trashFailed"), async () => {
          await projectFs.toTrash(root, entry.rel);
          // The disk changed: whatever refers to it lets go, and a folder open inside it closes.
          if (isInside(entry.rel, folder)) setFolder(parentRel(entry.rel));
          bump();
          await forgetRecents(root, entry.rel);
        }),
      restore: (entry) =>
        attempt(t("actions.restoreFailed"), async () => {
          const rel = await projectFs.restore(root, entry.id);
          bump();
          await afterRestore?.(rel);
          toast({ title: t("trash.restored", { name: entry.name }), description: rel });
        }),
      emptyTrash: () =>
        attempt(t("actions.emptyTrashFailed"), async () => {
          await projectFs.removeFromTrash(root, "all");
          bump();
        }),
      newFile: (type: FileType, target) => {
        const dir = encodeURIComponent(joinRelative(root, target));
        void navigate(`/${type}/${createId()}?dir=${dir}&project=${projectId}`);
      },
      setFolderColor: (rel, color) =>
        attempt(t("actions.updateFailed"), async () => {
          const folders = { ...manifest.folders };
          if (color) folders[rel] = { color };
          else delete folders[rel];
          await saveManifest({ folders });
        }),
    };
  }, [
    root,
    projectId,
    manifest.folders,
    saveManifest,
    folder,
    setFolder,
    bump,
    afterRestore,
    navigate,
  ]);
}
