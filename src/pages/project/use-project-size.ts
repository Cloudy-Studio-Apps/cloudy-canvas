import { useEffect, useState } from "react";

import { projectFs } from "@platform";
import { measureProject } from "@shared/core";

/** How many bytes the project takes, measured after the first paint; null until known. */
export function useProjectSize(root: string, rev: number): number | null {
  const [read, setRead] = useState<{ root: string; size: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // A project this large can take a moment to measure: a failure only leaves the size blank.
    measureProject(projectFs, root).then(
      (sizes) => {
        if (!cancelled) setRead({ root, size: sizes.total });
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [root, rev]);

  return read?.root === root ? read.size : null;
}
