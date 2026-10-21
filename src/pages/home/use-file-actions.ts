import { useMemo } from "react";
import { Copy, ExternalLink, FolderOpen, FolderSearch, X } from "lucide-react";

import { clipboard, revealFile } from "@platform";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import type { FileAction, FileActionsOptions } from "./use-file-actions.types";

/** What can be done with a recent file, shared by its ⋯ menu, its context menu and the missing-file popover. */
export function useFileActions({ file, missing, onOpen }: FileActionsOptions): FileAction[] {
  const relocate = useRecentFilesStore((s) => s.relocate);
  const forget = useRecentFilesStore((s) => s.forget);

  return useMemo(() => {
    const copyPath: FileAction = {
      id: "copy-path",
      label: "Copy path",
      icon: Copy,
      run: () =>
        void clipboard.writeText(file.path).then(
          () => toast({ title: "Path copied", description: file.path }),
          (error: unknown) => notifyError("The path couldn't be copied", error),
        ),
    };
    const remove: FileAction = {
      id: "forget",
      label: "Remove from recents",
      icon: X,
      destructive: true,
      run: () => void forget(file.id),
    };

    if (missing) {
      const locate: FileAction = {
        id: "locate",
        label: "Locate…",
        icon: FolderSearch,
        run: () => void relocate(file.id),
      };
      return [locate, copyPath, remove];
    }
    return [
      { id: "open", label: "Open", icon: ExternalLink, run: () => onOpen(file) },
      {
        id: "reveal",
        label: "Show in folder",
        icon: FolderOpen,
        run: () =>
          void revealFile(file.path).catch((error: unknown) =>
            notifyError("The folder couldn't be opened", error),
          ),
      },
      copyPath,
      remove,
    ];
  }, [file, missing, onOpen, relocate, forget]);
}
