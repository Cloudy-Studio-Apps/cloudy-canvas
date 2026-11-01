import type { DesignNode, NodeExport } from "../core";

/** One file a layer's exports will make. */
export interface PlannedExport {
  node: DesignNode;
  row: NodeExport;
  /** Its file name, unique among the planned files. */
  path: string;
}

/** A drawn export. */
export interface RenderedExport {
  path: string;
  file: Blob;
}
