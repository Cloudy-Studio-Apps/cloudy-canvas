import type { ExportFormat } from "@canvas";

import type { AgentBoard } from "./board-agent.types";

const ABSOLUTE_PATH = /^(?:\/|[A-Za-z]:[\\/]|\\\\)/;
const UNSAFE_NAME_CHARS = /[\\/:*?"<>|]/g;

/**
 * Where an agent's export goes: the path given (with the format's extension added when it's
 * missing), or a file named after the board next to the board's file.
 */
export function exportPath(
  board: AgentBoard,
  format: ExportFormat,
  path: string | undefined,
): string {
  if (path !== undefined) {
    if (!ABSOLUTE_PATH.test(path)) throw new Error(`"path" must be absolute, got ${path}.`);
    return path.toLowerCase().endsWith(`.${format}`) ? path : `${path}.${format}`;
  }
  if (!board.path) throw new Error('The board isn\'t saved yet: pass "path" or save it first.');
  const folder = board.path.replace(/[\\/][^\\/]*$/, "");
  const separator = board.path.includes("\\") && !board.path.includes("/") ? "\\" : "/";
  const name = board.name.replace(UNSAFE_NAME_CHARS, "_").trim() || "board";
  return `${folder}${separator}${name}.${format}`;
}
