import type { ElementKinds } from "@canvas";

import { isDesignNode, topFrames, type DesignNode } from "../core";
import type { DesignWorkspace } from "../../design-engine.types";
import { renderExports } from "./export-nodes";
import type { PlannedExport, RenderedExport } from "./export-nodes.types";

/**
 * What Export all lists on a page: its visible top-level frames in reading order, then any other
 * visible layer that has export rows, from the bottom up.
 */
export function exportItems(nodes: readonly DesignNode[], kinds: ElementKinds): DesignNode[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const shown = (node: DesignNode | undefined): boolean => {
    if (!node) return true;
    return node.visible && shown(node.parentId ? byId.get(node.parentId) : undefined);
  };
  const frames = topFrames(nodes, kinds).filter(isDesignNode);
  const listed = new Set<string>(frames.map((frame) => frame.id));
  const others = nodes.filter((n) => n.exports.length > 0 && !listed.has(n.id) && shown(n));
  return [...frames, ...others];
}

/** Draws the planned files on whichever page each is, leaving the workspace where it was. */
export async function renderAcrossPages(
  workspace: Pick<DesignWorkspace, "exportElements" | "scope" | "setScope">,
  planned: readonly PlannedExport[],
): Promise<RenderedExport[]> {
  const scope = workspace.scope;
  const files: RenderedExport[] = [];
  try {
    for (const file of planned) {
      if (workspace.scope !== file.node.pageId) workspace.setScope(file.node.pageId);
      files.push(...(await renderExports(workspace, [file])));
    }
  } finally {
    if (scope !== null && workspace.scope !== scope) workspace.setScope(scope);
  }
  return files;
}
