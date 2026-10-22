import type { FileInfo, FileType } from "./files.types";

/** Bump when the on-disk format changes in a non-backwards-compatible way. */
export const CURRENT_FORMAT_VERSION = 1;

export const FILE_EXTENSIONS: Record<FileType, string> = {
  board: "cboard",
  design: "cdesign",
};

export const ALL_FILE_EXTENSIONS: string[] = Object.values(FILE_EXTENSIONS);

/** Figma design files ("Save local copy…"), imported as new designs. */
export const FIGMA_FILE_EXTENSION = "fig";

export function isFileType(value: string | undefined): value is FileType {
  return value === "board" || value === "design";
}

/** Image files the app can show, by extension, with their media type. */
export const IMAGE_FILE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  bmp: "image/bmp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** File name without folders, e.g. "/home/me/Plan.cboard" → "Plan.cboard". */
export function baseNameFromPath(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

/** File name without folders or extension, e.g. "/home/me/Plan.cboard" → "Plan". */
export function fileNameFromPath(path: string): string {
  const base = baseNameFromPath(path);
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}

/** The lowercase extension of a file name or path, without the dot; `""` when it has none. */
export function extensionOf(path: string): string {
  const base = baseNameFromPath(path);
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : "";
}

/** The media type of an image file by its extension, or `null` when it isn't one. */
export function imageTypeFromName(name: string): string | null {
  return IMAGE_FILE_TYPES[extensionOf(name)] ?? null;
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

/** Whether the path is a Figma file, which opens as a new design imported from it. */
export function isFigmaPath(path: string): boolean {
  return extensionOf(path) === FIGMA_FILE_EXTENSION;
}

/** Whether the app opens this path: one of its own files, or a Figma file to import. */
export function isOpenablePath(path: string): boolean {
  return fileTypeFromPath(path) !== null || isFigmaPath(path);
}

/** Whether a value read from disk (e.g. the recent files index) is a well-formed `FileInfo`. */
export function isFileInfo(value: unknown): value is FileInfo {
  if (typeof value !== "object" || value === null) return false;
  const file = value as Record<string, unknown>;
  return (
    typeof file.id === "string" &&
    typeof file.name === "string" &&
    typeof file.type === "string" &&
    isFileType(file.type) &&
    typeof file.path === "string" &&
    typeof file.createdAt === "string" &&
    typeof file.updatedAt === "string" &&
    typeof file.formatVersion === "number" &&
    (file.draft === undefined || typeof file.draft === "boolean") &&
    (file.title === undefined || typeof file.title === "string") &&
    (file.description === undefined || typeof file.description === "string")
  );
}

/** The name to show for a file: its title, or its file name when it has none. */
export function displayName(file: Pick<FileInfo, "name" | "title">): string {
  return file.title || file.name;
}
