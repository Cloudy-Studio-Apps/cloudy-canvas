import { useEffect } from "react";

import { fileNameFromPath, fileTypeFromPath, type FileDrop } from "@shared/core";
import { fileOpenRequests } from "@platform";
import { useFileDropStore } from "@shared/stores/file-drop-store";
import { useRecentFilesStore } from "@shared/stores/recent-files-store";
import { notifyError, toast } from "@shared/stores/toast-store";
import { useUnsavedChangesStore } from "@shared/stores/unsaved-changes-store";
import { router } from "../router";

/**
 * Opens the first Cloudy Canvas file among launch paths, drops and forwarded launches. A drop
 * without one goes to the open editor, which adds the files to its canvas.
 */
export function useOpenRequests(): void {
  useEffect(() => {
    void fileOpenRequests
      .launchPaths()
      .then(openPaths, (error: unknown) =>
        console.error("[app] Couldn't read the launch files:", error),
      );
    const unlistenOpen = fileOpenRequests.onOpen(openPaths);
    const unlistenDrop = fileOpenRequests.onDrop(dropFiles);
    return () => {
      unlistenOpen();
      unlistenDrop();
    };
  }, []);
}

function dropFiles(drop: FileDrop): void {
  const paths = drop.files.map((file) => file.path).filter((path) => path !== null);
  const target = useFileDropStore.getState().target;
  if (paths.some((path) => fileTypeFromPath(path) !== null) || !target) {
    openPaths(paths);
    return;
  }
  target(drop);
}

function openPaths(paths: string[]): void {
  if (paths.length === 0) return;
  const path = paths.find((p) => fileTypeFromPath(p) !== null);
  if (!path) {
    toast({
      title: "That file can't be opened",
      description: "Cloudy Canvas opens .cboard and .cdesign files.",
      tone: "error",
    });
    return;
  }
  if (!useUnsavedChangesStore.getState().dirty) {
    void openPath(path);
    return;
  }
  toast({
    title: `Open “${fileNameFromPath(path)}”?`,
    description: "The open board has unsaved changes, which will be lost.",
    action: { label: "Open anyway", run: () => void openPath(path) },
  });
}

async function openPath(path: string): Promise<void> {
  try {
    const file = await useRecentFilesStore.getState().open(path);
    await router.navigate(`/${file.type}/${file.id}`);
  } catch (error) {
    notifyError("The file couldn't be opened", error);
  }
}
