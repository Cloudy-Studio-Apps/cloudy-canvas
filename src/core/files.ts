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

/** Returns the file type for a path based on its extension, or `null` if it isn't a Cloudy Canvas file. */
export function fileTypeFromPath(path: string): FileType | null {
  const ext = path.split(".").pop()?.toLowerCase();
  for (const [type, fileExt] of Object.entries(FILE_EXTENSIONS)) {
    if (fileExt === ext) return type as FileType;
  }
  return null;
}
