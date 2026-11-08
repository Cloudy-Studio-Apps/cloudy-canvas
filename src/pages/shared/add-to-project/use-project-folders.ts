import { useEffect, useState } from "react";

import { projectFs } from "@platform";

/** At most this many folders are listed, so a huge project doesn't keep the dialog waiting. */
const MAX_FOLDERS = 300;

const ROOT_ONLY = [""];

/** Every folder of a project (relative, `/`-separated), the root first; `[""]` until read. */
export function useProjectFolders(root: string | null): string[] {
  const [read, setRead] = useState<{ root: string; folders: string[] } | null>(null);

  useEffect(() => {
    if (root === null) return;
    let cancelled = false;
    void listFolders(root).then(
      (folders) => !cancelled && setRead({ root, folders }),
      // Unreadable: the root is still a place to put the file.
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [root]);

  return read !== null && read.root === root ? read.folders : ROOT_ONLY;
}

async function listFolders(root: string): Promise<string[]> {
  const found = [""];
  for (let i = 0; i < found.length && found.length < MAX_FOLDERS; i++) {
    const entries = await projectFs.scan(root, found[i]);
    const children = entries.filter((entry) => entry.kind === "folder").map((entry) => entry.rel);
    found.push(...children);
  }
  return ["", ...found.slice(1, MAX_FOLDERS).sort((a, b) => a.localeCompare(b))];
}
