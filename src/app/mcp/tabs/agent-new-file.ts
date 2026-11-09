import { projectRegistry, projectsSupported } from "@platform";
import { projectNameMatches, type AgentNewFile, type AgentProjectChoice } from "@canvas";
import { knownProjects } from "./agent-project-files";

/**
 * Where a new file goes (see "Where a file an agent creates is saved" in the file tabs spec): in a
 * project's folder when `project` is its id, as a new file from the project's home does; a draft
 * for `"none"`; and with only a `name`, the projects whose name matches its words, for the agent
 * to ask the user, unless none does (then a draft too).
 */
export async function resolveNewFile(
  options: AgentNewFile,
): Promise<{ params: Record<string, string> } | AgentProjectChoice> {
  const { name, project } = options;
  if (project === "none") return { params: {} };
  if (project !== undefined) {
    const record = projectsSupported() ? await projectRegistry.get(project) : null;
    if (!record)
      throw new Error(`No project with id "${project}". Use an id from matchingProjects.`);
    return { params: { dir: record.root, project: record.id } };
  }
  if (name) {
    const matching = (await knownProjects())
      .filter((p) => projectNameMatches(p.name, name))
      .map(({ id, name: projectName }) => ({ id, name: projectName }));
    if (matching.length > 0) return { matchingProjects: matching };
  }
  return { params: {} };
}
