import { designMigrations, encodeDesignFile } from "@design";
import { importStep, toastImportWarnings } from "@canvas-ui";
import { readLocalFile, storage } from "@platform";
import { createId, fileNameFromPath, type FileInfo } from "@shared/core";
import { runWithLoading } from "@shared/stores/loading-store";
import type { ReportLoading } from "@shared/stores/loading-store.types";
import { getDesignModules, getDesignProduct } from "../modules";
import { t } from "../design-ui.i18n";

/**
 * Imports the Figma file at `path` as a new design, kept as a draft (Save asks where to put it),
 * named after the file. The importer loads only now, the first time a Figma file is opened, and
 * reads the file in a worker; `report` hears each step (the loading screen). What couldn't be
 * brought over as it was is listed in a toast.
 */
export async function importFigmaFile(
  path: string,
  report: ReportLoading = () => undefined,
): Promise<FileInfo> {
  report(t("import.figma.reading"));
  const [{ convertFigmaFile, figmaDesignDocument }, bytes] = await Promise.all([
    import("@design/figma"),
    readLocalFile(path),
  ]);
  const converted = await convertFigmaFile(bytes, report);
  await importStep(report, t("import.figma.building"));
  const { doc, name, warnings } = figmaDesignDocument(
    converted,
    getDesignProduct().kinds,
    getDesignModules().get(designMigrations),
  );
  const title = name ?? fileNameFromPath(path);
  doc.setMeta({ title });
  await importStep(report, t("import.figma.saving"));
  const data = encodeDesignFile(doc.encode());
  doc.destroy();
  const file = await storage.saveDraft(createId(), title, "design", data, { title });
  toastImportWarnings(warnings);
  return file;
}

/** `importFigmaFile` behind the loading screen, which covers the window until it's done. */
export function importFigmaWithLoading(path: string): Promise<FileInfo> {
  return runWithLoading(t("import.figma.importing", { name: fileNameFromPath(path) }), (report) =>
    importFigmaFile(path, report),
  );
}
