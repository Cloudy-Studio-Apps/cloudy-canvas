import type { FileType } from "./files.types";

/** Bump when the on-disk format changes in a non-backwards-compatible way. */
export const CURRENT_FORMAT_VERSION = 1;

export const FILE_EXTENSIONS: Record<FileType, string> = {
  board: "cboard",
  design: "cdesign",
};

export const ALL_FILE_EXTENSIONS: string[] = Object.values(FILE_EXTENSIONS);

export function isFileType(value: string | undefined): value is FileType {
  return value === "board" || value === "design";
}

/** File name without folders or extension, e.g. "/home/me/Plan.cboard" → "Plan". */
export function fileNameFromPath(path: string): string {
  const base = path.split(/[\\/]/).pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}

/** Appends the file type's extension when the path doesn't already end with it. */
export function withFileExtension(path: string, type: FileType): string {
  const ext = `.${FILE_EXTENSIONS[type]}`;
  return path.toLowerCase().endsWith(ext) ? path : path + ext;
}

/** Returns the file type for a path based on its extension, or `null` if it isn't a Cloudy Canvas file. */
export function fileTypeFromPath(path: string): FileType | null {
  const ext = path.split(".").pop()?.toLowerCase();
  for (const [type, fileExt] of Object.entries(FILE_EXTENSIONS)) {
    if (fileExt === ext) return type as FileType;
  }
  return null;
}
