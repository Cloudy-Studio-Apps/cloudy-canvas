import { withExportCopy } from "@canvas";

import { layerNameOf, type DesignNode } from "../core";
import type { DesignWorkspace } from "../../design-engine.types";
import { uniqueFileName } from "./export-file-name";
import type { PlanExportOptions, PlannedExport, RenderedExport } from "./export-nodes.types";

/**
 * What the layers' exports will make, each with its file name, in their order. A layer without rows
 * makes nothing, or `fallback`'s file; `folderOf` puts a layer's files in a folder, where names
 * only have to be unique.
 */
export function plannedExports(
  workspace: Pick<DesignWorkspace, "kinds">,
  nodes: readonly DesignNode[],
  { fallback, folderOf }: PlanExportOptions = {},
): PlannedExport[] {
  const usedIn = new Map<string, Set<string>>();
  return nodes.flatMap((node) => {
    const layer = layerNameOf(node, workspace.kinds);
    const folder = folderOf?.(node) ?? "";
    const used = usedIn.get(folder) ?? new Set<string>();
    usedIn.set(folder, used);
    const rows = node.exports.length > 0 ? node.exports : fallback ? [fallback] : [];
    return rows.map((row) => {
      const name = uniqueFileName(layer, row.suffix, row.format, used);
      return { node, row, path: folder ? `${folder}/${name}` : name };
    });
  });
}

/**
 * Draws the planned files, one at a time: exactly the layer with what it holds, no padding, and
 * what can be transparent stays so. Drawn from a copy of the design when one is needed
 * (`withExportCopy`: repeats past their design caps show every row), never changing the file.
 */
export function renderExports(
  workspace: DesignWorkspace,
  planned: readonly PlannedExport[],
): Promise<RenderedExport[]> {
  return withExportCopy(workspace, (drawn) => drawExports(drawn, planned));
}

/** `renderExports` on the workspace given (a copy readied for the export, or the design). */
export async function drawExports(
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
