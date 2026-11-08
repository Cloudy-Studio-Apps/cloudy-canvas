import { useEffect, useRef, useState } from "react";

import { projectFs } from "@platform";
import { measureProject } from "@shared/core";

/** The least time between two measures of the project. */
const MEASURE_GAP_MS = 500;

/**
 * How many bytes the project takes, measured after the first paint and again after file actions
 * (`rev`): at most once per 500 ms, a newer action cancelling a walk still running. Null until
 * known.
 */
export function useProjectSize(root: string, rev: number): number | null {
  const [read, setRead] = useState<{ root: string; size: number } | null>(null);
  const lastStart = useRef(0);

  useEffect(() => {
    const abort = new AbortController();
    const wait = Math.max(0, lastStart.current + MEASURE_GAP_MS - Date.now());
    const timer = setTimeout(() => {
      lastStart.current = Date.now();
      // A project this large can take a moment to measure: a failure only leaves the size blank.
      measureProject(projectFs, root, abort.signal).then(
        (sizes) => {
          if (!abort.signal.aborted) setRead({ root, size: sizes.total });
        },
        () => undefined,
      );
    }, wait);
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [root, rev]);

  return read?.root === root ? read.size : null;
}
