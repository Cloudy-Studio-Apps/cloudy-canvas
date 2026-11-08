import { useEffect, useState } from "react";

import { LibraryDocument } from "@canvas";
import { projectFs } from "@platform";
import { projectPaths } from "@shared/core";
import { libraryColors } from "./library-colors";

/** How many swatches a project card or cover shows. */
const SWATCHES = 5;

/**
 * The colors of a project's first library (the manifest's first by order), read from its `.clib`
 * when `enabled`; empty until read, and for a project with no library or an unreadable one.
 */
export function useProjectLibraryColors(root: string, id: string, enabled: boolean): string[] {
  const [colors, setColors] = useState<string[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const read = async () => {
      const manifest = await projectFs.readManifest(root, id);
      const first = [...(manifest?.libraries ?? [])].sort((a, b) =>
        a.order < b.order ? -1 : a.order > b.order ? 1 : 0,
      )[0];
      if (!first) return [];
      const bytes = await projectFs.readBytes(projectPaths(root).library(first.file));
      return libraryColors(LibraryDocument.fromFile(bytes).tokenRecords(), SWATCHES);
    };
    read().then(
      (found) => {
        if (!cancelled) setColors(found);
      },
      () => {
        if (!cancelled) setColors([]);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, id, enabled]);
  return colors;
}
