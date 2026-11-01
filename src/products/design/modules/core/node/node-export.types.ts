import type { ExportFormat } from "@canvas";

/** The file types a layer can export as. */
export type NodeExportFormat = Extract<ExportFormat, "png" | "jpg" | "svg" | "pdf">;

/** One file a layer exports as: a row of the Export section. */
export interface NodeExport {
  id: string;
  /** Pixels per world unit (SVG and PDF ignore it). */
  scale: number;
  /** Added to the file name after the layer's (`@2x`). */
  suffix: string;
  format: NodeExportFormat;
}
