import { useEffect } from "react";

import { isOpenablePath, type FileDrop } from "@shared/core";
import { appLinks, fileOpenRequests } from "@platform";
import { useFileDropStore } from "@shared/stores/file-drop-store";
import { openAppLinks } from "./open-app-links";
import { openPaths } from "./open-paths";

/**
 * Opens the first Cloudy Canvas (or Figma) file among launch paths, drops and forwarded launches, and
 * follows `cloudy-canvas://` links. A drop without a file goes to the open editor, which adds
 * the files to its canvas.
 */
export function useOpenRequests(): void {
  useEffect(() => {
    void fileOpenRequests
      .launchPaths()
      .then(openPaths, (error: unknown) =>
        console.error("[app] Couldn't read the launch files:", error),
      );
    void appLinks
      .launchLinks()
      .then(openAppLinks, (error: unknown) =>
        console.error("[app] Couldn't read the launch links:", error),
      );
    const unlistenOpen = fileOpenRequests.onOpen(openPaths);
    const unlistenDrop = fileOpenRequests.onDrop(dropFiles);
    const unlistenLinks = appLinks.onOpen(openAppLinks);
    return () => {
      unlistenOpen();
      unlistenDrop();
      unlistenLinks();
    };
  }, []);
}

function dropFiles(drop: FileDrop): void {
  const paths = drop.files.map((file) => file.path).filter((path) => path !== null);
  const target = useFileDropStore.getState().target;
  if (paths.some(isOpenablePath) || !target) {
    openPaths(paths);
    return;
  }
  target(drop);
}
