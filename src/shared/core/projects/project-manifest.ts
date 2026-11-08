import type {
  FolderStyle,
  LibraryEntry,
  ProjectCover,
  ProjectManifest,
} from "./project-manifest.types";

export const PROJECT_EXTENSION = "cproject";
export const LIBRARY_EXTENSION = "clib";
export const PROJECT_DATA_DIR = ".cloudy";
export const LIBRARIES_DIR = "libraries";
export const TRASH_DIR = "trash";
export const MANIFEST_FORMAT = 1;

type Obj = Record<string, unknown>;

function isObj(value: unknown): value is Obj {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(obj: Obj, key: string, where: string): string {
  const v = obj[key];
  if (typeof v !== "string") throw new Error(`Project manifest: ${where}${key} must be a string`);
  return v;
}

function parseCover(value: unknown): ProjectCover | null {
  if (value === undefined || value === null) return null;
  if (!isObj(value)) throw new Error("Project manifest: cover must be an object or null");
  if (value.kind === "colors") return { kind: "colors" };
  if (value.kind === "image") return { kind: "image", file: str(value, "file", "cover.") };
  throw new Error("Project manifest: cover.kind must be 'colors' or 'image'");
}

function parseLibrary(value: unknown, index: number): LibraryEntry {
  const where = `libraries[${index}].`;
  if (!isObj(value)) throw new Error(`Project manifest: libraries[${index}] must be an object`);
  if (value.autoAdd !== undefined && typeof value.autoAdd !== "boolean") {
    throw new Error(`Project manifest: ${where}autoAdd must be a boolean`);
  }
  return {
    id: str(value, "id", where),
    name: str(value, "name", where),
    file: str(value, "file", where),
    order: str(value, "order", where),
    autoAdd: value.autoAdd ?? true,
  };
}

function parseFolders(value: unknown): Record<string, FolderStyle> {
  if (value === undefined || value === null) return {};
  if (!isObj(value)) throw new Error("Project manifest: folders must be an object");
  const folders: Record<string, FolderStyle> = {};
  for (const [path, style] of Object.entries(value)) {
    if (!isObj(style)) throw new Error(`Project manifest: folders["${path}"] must be an object`);
    if (style.color !== undefined && typeof style.color !== "string") {
      throw new Error(`Project manifest: folders["${path}"].color must be a string`);
    }
    folders[path] = style.color === undefined ? {} : { color: style.color };
  }
  return folders;
}

/** Reads a `.cproject` file's text; throws an `Error` naming what is wrong. */
export function parseManifest(text: string): ProjectManifest {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Project manifest: not valid JSON");
  }
  if (!isObj(data)) throw new Error("Project manifest: must be a JSON object");
  if (data.format !== MANIFEST_FORMAT) {
    throw new Error(`Project manifest: unsupported format ${String(data.format)}`);
  }
  const icon = data.icon;
  if (icon !== undefined && icon !== null && typeof icon !== "string") {
    throw new Error("Project manifest: icon must be a string or null");
  }
  const libraries = data.libraries ?? [];
  if (!Array.isArray(libraries)) throw new Error("Project manifest: libraries must be an array");
  return {
    format: 1,
    id: str(data, "id", ""),
    name: str(data, "name", ""),
    color: str(data, "color", ""),
    icon: icon ?? null,
    cover: parseCover(data.cover),
    libraries: libraries.map(parseLibrary),
    folders: parseFolders(data.folders),
  };
}

export function serializeManifest(manifest: ProjectManifest): string {
  return JSON.stringify(manifest, null, 2);
}
