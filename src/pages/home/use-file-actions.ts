import { useMemo } from "react";
import { Copy, ExternalLink, FolderOpen, FolderSearch, Trash2, X } from "lucide-react";

import { clipboard, revealFile } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { FileAction, FileActionsOptions } from "./use-file-actions.types";
import { t } from "./home.i18n";

/** What can be done with a recent file, shared by its ⋯ menu, its context menu and the missing-file popover. */
export function useFileActions({ file, missing, onOpen }: FileActionsOptions): FileAction[] {
  const relocate = useRecentFilesStore((s) => s.relocate);
  const forget = useRecentFilesStore((s) => s.forget);

  return useMemo(() => {
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
    const remove: FileAction = {
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
      return [locate, copyPath, remove];
    }
    return [
      { id: "open", label: t("actions.open"), icon: ExternalLink, run: () => onOpen(file) },
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
