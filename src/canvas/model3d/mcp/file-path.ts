/** The last part of a path, with either kind of separator. */
export function baseName(path: string): string {
  return path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
}

/** `name` (which may name a sub-folder) in the folder `path` is in. */
export function siblingPath(path: string, name: string): string {
  const cut = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  const separator = path.includes("\\") && !path.includes("/") ? "\\" : "/";
  return path.slice(0, cut + 1) + name.replace(/[\\/]/g, separator);
}
