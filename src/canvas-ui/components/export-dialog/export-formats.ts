import type { ExportFormat } from "@canvas";
import type { ExportFileType } from "@platform";
import { t } from "../components.i18n";

/** The file types the export dialog offers, in its order. */
export const EXPORT_FORMATS: readonly (ExportFileType & { id: ExportFormat; name: string })[] = [
  { id: "png", name: "PNG", extension: "png", label: t("export.formats.png") },
  { id: "jpg", name: "JPG", extension: "jpg", label: t("export.formats.jpg") },
  { id: "pdf", name: "PDF", extension: "pdf", label: t("export.formats.pdf") },
  { id: "csv", name: "CSV", extension: "csv", label: t("export.formats.csv") },
];
