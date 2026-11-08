import { boardMigrations, encodeBoardFile } from "@board";
import { importStep, toastImportWarnings } from "@canvas-ui";
import { readLocalFile, storage } from "@platform";
import { createId, fileNameFromPath, type FileInfo } from "@shared/core";
import { runWithLoading } from "@shared/stores/loading-store";
import type { ReportLoading } from "@shared/stores/loading-store.types";
import { getBoardModules, getBoardProduct } from "../modules";
import { t } from "../board-ui.i18n";

/**
 * Imports the FigJam file at `path` as a new board, kept as a draft (Save asks where to put it),
 * named after the file. The importer loads only now, the first time a FigJam file is opened, and
 * reads the file in a worker; `report` hears each step (the loading screen). What couldn't be
 * brought over as it was is listed in a toast.
 */
export async function importFigJamFile(
  path: string,
  report: ReportLoading = () => undefined,
): Promise<FileInfo> {
  report(t("import.figjam.reading"));
  const [{ convertFigJamFile, figjamBoardDocument }, bytes] = await Promise.all([
    import("@board/figjam"),
    readLocalFile(path),
  ]);
  const converted = await convertFigJamFile(bytes, report);
  await importStep(report, t("import.figjam.building"));
  const { doc, name, warnings } = figjamBoardDocument(
    converted,
    getBoardProduct().kinds,
    getBoardModules().get(boardMigrations),
  );
  const title = name ?? fileNameFromPath(path);
  doc.setMeta({ title });
  await importStep(report, t("import.figjam.saving"));
  const data = encodeBoardFile(doc.encode());
  doc.destroy();
  const file = await storage.saveDraft(createId(), title, "board", data, { title });
  toastImportWarnings(warnings);
  return file;
}

/** `importFigJamFile` behind the loading screen, which covers the window until it's done. */
export function importFigJamWithLoading(path: string): Promise<FileInfo> {
  return runWithLoading(t("import.figjam.importing", { name: fileNameFromPath(path) }), (report) =>
    importFigJamFile(path, report),
  );
}
