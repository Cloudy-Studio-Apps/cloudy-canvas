import type { DesignWorkspace } from "../../../design-engine.types";
import type { DesignBrochure } from "./design-brochure";
import { DESIGN_BROCHURES } from "./design-brochures";

/** The open brochure of the design page a workspace is on, or `null` when the page has none. */
export function currentBrochure(workspace: DesignWorkspace): DesignBrochure | null {
  return workspace.service(DESIGN_BROCHURES).current(workspace.scope);
}

/**
 * The open brochure of the workspace's design page, made (and opened) when the page has none yet:
 * what picking frames or adding a blank page does on a page without one.
 */
export function ensureBrochure(workspace: DesignWorkspace): DesignBrochure {
  const current = currentBrochure(workspace);
  if (current) return current;
  if (workspace.scope === null) throw new Error("There's no design page on screen.");
  return workspace.service(DESIGN_BROCHURES).create(workspace.scope);
}
