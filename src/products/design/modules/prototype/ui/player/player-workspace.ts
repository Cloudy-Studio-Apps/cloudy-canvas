import type { DesignEngine, DesignWorkspace } from "../../../../design-engine.types";

/** The workspace the player reads and draws in, so the page on the user's screen never changes. */
const WORKSPACE = "prototype:player";

/** The player's workspace, on design page `page`. */
export function playerWorkspace(engine: DesignEngine, page: string): DesignWorkspace {
  const workspace = engine.workspace(WORKSPACE);
  if (workspace.scope !== page) workspace.setScope(page);
  return workspace;
}
