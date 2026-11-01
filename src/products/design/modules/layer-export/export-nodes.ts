import { layerNameOf, type DesignNode } from "../core";
import type { DesignWorkspace } from "../../design-engine.types";
import { uniqueFileName } from "./export-file-name";
import type { PlannedExport, RenderedExport } from "./export-nodes.types";

/** What the layers' exports will make, each with its file name, in their order. */
export function plannedExports(
  workspace: Pick<DesignWorkspace, "kinds">,
  nodes: readonly DesignNode[],
): PlannedExport[] {
  const used = new Set<string>();
  return nodes.flatMap((node) => {
    const layer = layerNameOf(node, workspace.kinds);
    return node.exports.map((row) => ({
      node,
      row,
      path: uniqueFileName(layer, row.suffix, row.format, used),
    }));
  });
}

/**
 * Draws the planned files, one at a time: exactly the layer with what it holds, no padding, and
 * what can be transparent stays so.
 */
export async function renderExports(
  workspace: Pick<DesignWorkspace, "exportElements">,
  planned: readonly PlannedExport[],
): Promise<RenderedExport[]> {
  const files: RenderedExport[] = [];
  for (const { node, row, path } of planned) {
    const file = await workspace.exportElements({
      format: row.format,
      background: row.format === "jpg" || row.format === "pdf" ? "solid" : "transparent",
      area: "board",
      ids: [node.id],
      scale: row.scale,
      padding: 0,
    });
    files.push({ path, file });
  }
  return files;
}
