import { useMemo } from "react";
import { Copy, Download, ExternalLink, FolderOpen, FolderSearch, Trash2, X } from "lucide-react";

import { clipboard, confirmDelete, exportFile, revealFile, storage } from "@platform";
import { FILE_EXTENSIONS, isAndroidPlatform, type FileInfo } from "@shared/core";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { FileAction, FileActionsOptions } from "./use-file-actions.types";
import { t } from "./home.i18n";

/** Hands out a copy of a file the app keeps (Android has no folder of them to go to). */
async function saveCopy({ id, name, type }: FileInfo): Promise<void> {
  const data = (await storage.load(id)) as BlobPart;
  await exportFile(new Blob([data]), name, { extension: FILE_EXTENSIONS[type], label: name });
}

/** What can be done with a recent file, shared by its ⋯ menu, its context menu and the missing-file popover. */
export function useFileActions({ file, missing, onOpen }: FileActionsOptions): FileAction[] {
  const relocate = useRecentFilesStore((s) => s.relocate);
  const forget = useRecentFilesStore((s) => s.forget);

  return useMemo(() => {
    const android = isAndroidPlatform();
    const copyPath: FileAction = {
      id: "copy-path",
      label: t("actions.copyPath"),
      icon: Copy,
      run: () =>
        void clipboard.writeText(file.path).then(
          () => toast({ title: t("actions.pathCopied"), description: file.path }),
          (error: unknown) => notifyError(t("actions.copyFailed"), error),
        ),
    };
    // On Android the list is the only way to a file, so leaving it deletes it.
    const remove: FileAction = android
      ? {
          id: "forget",
          label: t("actions.delete"),
          icon: Trash2,
          destructive: true,
          run: () =>
            void confirmDelete(file.name).then(
              (confirmed) => (confirmed ? forget(file.id) : undefined),
              (error: unknown) => notifyError(t("actions.deleteFailed"), error),
            ),
        }
      : {
          id: "forget",
          label: file.draft ? t("actions.deleteDraft") : t("actions.remove"),
          icon: file.draft ? Trash2 : X,
          destructive: true,
          run: () => void forget(file.id),
        };

    if (missing) {
      const locate: FileAction = {
        id: "locate",
        label: t("actions.locate"),
        icon: FolderSearch,
        run: () => void relocate(file.id),
      };
      return android ? [locate, remove] : [locate, copyPath, remove];
    }
    const open: FileAction = {
      id: "open",
      label: t("actions.open"),
      icon: ExternalLink,
      run: () => onOpen(file),
    };
    if (android) {
      const copy: FileAction = {
        id: "save-copy",
        label: t("actions.saveCopy"),
        icon: Download,
        run: () =>
          void saveCopy(file).catch((error: unknown) =>
            notifyError(t("actions.saveCopyFailed"), error),
          ),
      };
      return [open, copy, remove];
    }
    return [
      open,
      {
        id: "reveal",
        label: t("actions.reveal"),
        icon: FolderOpen,
        run: () =>
          void revealFile(file.path).catch((error: unknown) =>
            notifyError(t("actions.revealFailed"), error),
          ),
      },
      copyPath,
      remove,
    ];
  }, [file, missing, onOpen, relocate, forget]);
}
