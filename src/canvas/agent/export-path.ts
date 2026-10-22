import type { ExportFormat } from "../export";
import type { AgentFile } from "./agent-file.types";

const ABSOLUTE_PATH = /^(?:\/|[A-Za-z]:[\\/]|\\\\)/;
const UNSAFE_NAME_CHARS = /[\\/:*?"<>|]/g;

/**
 * Where an agent's export goes: the path given (with the format's extension added when it's
 * missing), or a file named after the open file next to it. `noun` names it in errors ("board").
 */
export function exportPath(
  file: Pick<AgentFile<unknown>, "name" | "path">,
  format: ExportFormat,
  path: string | undefined,
  noun: string,
): string {
  if (path !== undefined) {
    if (!ABSOLUTE_PATH.test(path)) throw new Error(`"path" must be absolute, got ${path}.`);
    return path.toLowerCase().endsWith(`.${format}`) ? path : `${path}.${format}`;
  }
  if (!file.path) throw new Error(`The ${noun} isn't saved yet: pass "path" or save it first.`);
  const folder = file.path.replace(/[\\/][^\\/]*$/, "");
  const separator = file.path.includes("\\") && !file.path.includes("/") ? "\\" : "/";
  const name = file.name.replace(UNSAFE_NAME_CHARS, "_").trim() || noun;
  return `${folder}${separator}${name}.${format}`;
}
