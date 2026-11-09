import type { ToolArgs } from "./mcp-tool.types";
import type {
  AgentFileCandidates,
  AgentFileRef,
  AgentNewFile,
  AgentProjectChoice,
} from "./agent-tabs.types";
import { optionalString } from "./tool-args";

export const SEVERAL_FILES_MATCH = "Several files match; ask the user which one.";
export const ASK_ABOUT_PROJECT =
  'Ask the user whether to save it in this project, then call again with project set to its id or "none".';

export function isFileCandidates(value: unknown): value is AgentFileCandidates {
  return typeof value === "object" && value !== null && "candidates" in value;
}

export function isProjectChoice(value: unknown): value is AgentProjectChoice {
  return typeof value === "object" && value !== null && "matchingProjects" in value;
}

/** A name for comparing: trimmed, lower case, without a `.cboard`/`.cdesign` ending. */
export function nameKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\.(cboard|cdesign)$/, "");
}

/** Whether two names are the same file's (case-insensitive, extension ignored). */
export function sameFileName(a: string, b: string): boolean {
  return nameKey(a) === nameKey(b);
}

const words = (name: string) => new Set(name.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);

/**
 * Whether a project's name is meant by a requested file name: every word of one is among the words
 * of the other, ignoring case ("Marketing" matches "Marketing banner"; "Ads" doesn't match
 * "Marketing").
 */
export function projectNameMatches(projectName: string, requested: string): boolean {
  const project = words(projectName);
  const asked = words(requested);
  if (project.size === 0 || asked.size === 0) return false;
  const within = (small: Set<string>, big: Set<string>) => [...small].every((w) => big.has(w));
  return within(project, asked) || within(asked, project);
}

/** `id`, else `name`; throws when neither is given. */
export function fileRefArg(args: ToolArgs): AgentFileRef {
  const id = optionalString(args, "id");
  if (id) return { id };
  const name = optionalString(args, "name")?.trim();
  if (name) return { name };
  throw new Error('Give "id" (from the recent list) or "name".');
}

export function newFileArgs(args: ToolArgs): AgentNewFile {
  const name = optionalString(args, "name")?.trim();
  const project = optionalString(args, "project");
  return { ...(name && { name }), ...(project && { project }) };
}
