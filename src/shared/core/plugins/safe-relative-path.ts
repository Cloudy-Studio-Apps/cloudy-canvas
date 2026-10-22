/** Whether a path stays inside the folder it's relative to (no `..`, not absolute). */
export function isSafeRelativePath(path: string): boolean {
  if (!path || path.startsWith("/") || path.startsWith("\\") || /^[a-zA-Z]:/.test(path)) {
    return false;
  }
  return path.split(/[\\/]/).every((part) => part !== ".." && part !== "");
}
