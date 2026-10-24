import type { ExportHost } from "../../export";
import type { SceneExportOptions } from "./export-host.types";
import { withMembers } from "./members";
import type { WorkspaceParts } from "./workspace-parts.types";

/**
 * What exports read of a workspace: its scene's elements (the whole scope, or `ids` or its
 * selection with what moves with them) and the renderer's off-screen snapshot.
 */
export function sceneExportHost(parts: WorkspaceParts, options: SceneExportOptions): ExportHost {
  const { kinds, product, scene } = parts;
  return {
    elementsOf: (area, ids) => {
      if (!ids && area === "board") return [...scene.elements];
      const members = withMembers(parts, ids ?? options.selected(), "move");
      return scene.elements.filter((el) => members.has(el.id));
    },
    // Exports take what effects draw past the content too (shadows, blurs), as Figma does.
    bounds: (el) => scene.visualBounds(el),
    rows: (el) => kinds.kindOf(el).rows(el),
    createLinks: () => product.createLinks?.() ?? [],
    background: options.background,
    snapshot: options.snapshot,
  };
}
