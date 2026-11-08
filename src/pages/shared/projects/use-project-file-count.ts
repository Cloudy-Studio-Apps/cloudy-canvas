import { useEffect, useState } from "react";

import { projectFs } from "@platform";

/** How deep the count looks into folders. */
const MAX_DEPTH = 6;

async function countFiles(root: string, rel: string, depth: number): Promise<number> {
  const entries = await projectFs.scan(root, rel === "" ? undefined : rel);
  let count = 0;
  for (const entry of entries) {
    if (entry.kind === "board" || entry.kind === "design") count += 1;
    else if (entry.kind === "folder" && depth < MAX_DEPTH) {
      count += await countFiles(root, entry.rel, depth + 1);
    }
  }
  return count;
}

/** How many boards and designs a project's folder holds, read when `enabled`; `null` until then. */
export function useProjectFileCount(root: string, enabled: boolean): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    countFiles(root, "", 0).then(
      (n) => {
        if (!cancelled) setCount(n);
      },
      () => {
        if (!cancelled) setCount(null);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, enabled]);
  return count;
}
