import type { ExportFormat } from "@canvas";
import type { ExportFileType } from "@platform";

/** The file types the export dialog offers, in its order. */
export const EXPORT_FORMATS: readonly (ExportFileType & { id: ExportFormat; name: string })[] = [
  { id: "png", name: "PNG", extension: "png", label: "PNG image" },
  { id: "jpg", name: "JPG", extension: "jpg", label: "JPEG image" },
  { id: "pdf", name: "PDF", extension: "pdf", label: "PDF document" },
  { id: "csv", name: "CSV", extension: "csv", label: "CSV table" },
];
