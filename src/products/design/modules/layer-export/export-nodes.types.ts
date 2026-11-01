import type { DesignNode, NodeExport } from "../core";

export interface PlanExportOptions {
  /** What a layer without rows exports as. */
  fallback?: NodeExport;
  /** The folder a layer's files go in. */
  folderOf?: (node: DesignNode) => string;
}

/** One file a layer's exports will make. */
export interface PlannedExport {
  node: DesignNode;
  row: NodeExport;
  /** Its path, unique among the planned files. */
  path: string;
}

/** A drawn export. */
export interface RenderedExport {
  path: string;
  file: Blob;
}
