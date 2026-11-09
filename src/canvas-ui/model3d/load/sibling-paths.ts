import { baseName } from "./external-texture";

/** Folders next to a model that commonly hold its pictures. */
const TEXTURE_FOLDERS = ["textures/", "Textures/"];

/**
 * Where to look next to the model for a file it refers to, in order: the reference as written
 * (only when it's relative and never climbs out with `..`), its name alone, then its name in a
 * `textures` folder. An absolute path (an artist's `C:\Users\…\wood.png`) is never read as it is.
 */
export function siblingPaths(reference: string): string[] {
  const name = baseName(reference);
  if (!name || name === "." || name === "..") return [];
  const asWritten = (reference.split(/[?#]/)[0] ?? reference).replace(/^(\.[\\/])+/, "");
  const paths = isSafeRelative(asWritten) ? [asWritten] : [];
  paths.push(name, ...TEXTURE_FOLDERS.map((folder) => folder + name));
  return [...new Set(paths)];
}

/** A relative path with no `..` part (and no drive, root or URL scheme). */
export function isSafeRelative(path: string): boolean {
  if (!path || /^[\\/]/.test(path) || /^[a-zA-Z]:/.test(path) || path.includes("://")) return false;
  return !path.split(/[\\/]/).includes("..");
}
