import { PROJECT_DATA_DIR } from "./project-manifest";

const WINDOWS_DEVICES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

/** Names a file or folder can't have in a project: the data folder, Windows-invalid names, empty. */
export function isReservedName(name: string): boolean {
  if (name.trim() === "") return true;
  if (name.toLowerCase() === PROJECT_DATA_DIR) return true;
  if (/[<>:"/\\|?*]/.test(name) || [...name].some((c) => c.charCodeAt(0) < 32)) return true;
  if (name.endsWith(".") || name.endsWith(" ")) return true;
  return WINDOWS_DEVICES.test(name);
}

/** `name`, or `name 2`, `name 3`… (before the extension) until it isn't in `taken` (case-insensitive). */
export function uniqueName(name: string, taken: ReadonlySet<string>): string {
  const lower = new Set([...taken].map((n) => n.toLowerCase()));
  if (!lower.has(name.toLowerCase())) return name;
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let n = 2; ; n++) {
    const candidate = `${stem} ${n}${ext}`;
    if (!lower.has(candidate.toLowerCase())) return candidate;
  }
}
