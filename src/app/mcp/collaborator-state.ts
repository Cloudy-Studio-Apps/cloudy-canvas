import type { ActorWorkspace } from "@canvas";
import type { CollaboratorState } from "@shared/core";
import type { PresenceFile } from "./presence-file.types";

/** Where an agent is, read from its workspace on the open file (page, view, selection). */
export function workspaceState(
  file: PresenceFile,
  workspace: ActorWorkspace<object>,
): Partial<CollaboratorState> {
  return {
    fileId: file.id,
    scope: workspace.scope,
    scopeLabel: file.engine.scopeLabel(workspace.scope),
    viewport: workspace.viewport,
    selection: workspace.selectedIds(),
  };
}
