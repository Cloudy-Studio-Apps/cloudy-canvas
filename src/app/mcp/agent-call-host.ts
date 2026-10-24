import type { ActorWorkspace, AgentFile, CanvasEngine } from "@canvas";

/**
 * The open file as collaborator `id` works on it: the same file, with its own workspace (made
 * the first time, on the page and view the user has then) in place of the user's engine.
 */
export function withWorkspace<O extends object>(
  file: AgentFile<CanvasEngine<O>>,
  id: string,
): AgentFile<ActorWorkspace<O>> {
  return { ...file, engine: file.engine.workspace(id) };
}
