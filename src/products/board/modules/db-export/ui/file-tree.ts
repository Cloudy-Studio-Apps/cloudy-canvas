import type { FileTreeRow } from "./file-tree.types";

/** Paths as a tree: each folder once, before what it holds; folders before files, then by name. */
export function fileTree(paths: readonly string[]): FileTreeRow[] {
  const sorted = [...paths].sort((a, b) => {
    const as = a.split("/");
    const bs = b.split("/");
    for (let i = 0; i < Math.min(as.length, bs.length); i++) {
      const x = as[i] ?? "";
      const y = bs[i] ?? "";
      if (x === y) continue;
      const xFolder = i < as.length - 1;
      const yFolder = i < bs.length - 1;
      if (xFolder !== yFolder) return xFolder ? -1 : 1;
      return x.localeCompare(y);
    }
    return as.length - bs.length;
  });
  const rows: FileTreeRow[] = [];
  const folders = new Set<string>();
  for (const path of sorted) {
    const parts = path.split("/");
    parts.slice(0, -1).forEach((name, depth) => {
      const folder = parts.slice(0, depth + 1).join("/");
      if (folders.has(folder)) return;
      folders.add(folder);
      rows.push({ kind: "folder", name, path: folder, depth });
    });
    rows.push({
      kind: "file",
      name: parts[parts.length - 1] ?? path,
      path,
      depth: parts.length - 1,
    });
  }
  return rows;
}
