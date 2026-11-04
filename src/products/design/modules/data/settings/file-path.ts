/** Last path segment, either slash. */
export function baseName(path: string): string {
  return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
}

/** A file name without its extension (`products.csv` → `products`; `.env` stays). */
export function withoutExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

/** Whether text is an absolute path on some system (`/…`, `\\…`, `C:\…`, `C:/…`). */
export function isAbsolutePath(path: string): boolean {
  return /^([a-zA-Z]:[\\/]|[\\/])/.test(path);
}
