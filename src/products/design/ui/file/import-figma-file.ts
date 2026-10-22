import { designMigrations, encodeDesignFile } from "@design";
import { readLocalFile, storage } from "@platform";
import { createId, fileNameFromPath, type FileInfo } from "@shared/core";
import { runWithLoading } from "@shared/stores/loading-store";
import type { ReportLoading } from "@shared/stores/loading-store.types";
import { toast } from "@shared/stores/toast-store";
import { getDesignModules, getDesignProduct } from "../modules";

/** Most losses listed in the toast; the rest are summed up. */
const LISTED_WARNINGS = 4;

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
  report("Reading file");
  const [{ convertFigmaFile, figmaDesignDocument }, bytes] = await Promise.all([
    import("@design/figma"),
    readLocalFile(path),
  ]);
  const converted = await convertFigmaFile(bytes, report);
  await step(report, "Building design");
  const { doc, name, warnings } = figmaDesignDocument(
    converted,
    getDesignProduct().kinds,
    getDesignModules().get(designMigrations),
  );
  const title = name ?? fileNameFromPath(path);
  doc.setMeta({ title });
  await step(report, "Saving draft");
  const data = encodeDesignFile(doc.encode());
  doc.destroy();
  const file = await storage.saveDraft(createId(), title, "design", data, { title });
  if (warnings.length > 0) {
    toast({ title: "Imported with changes", description: summary(warnings) });
  }
  return file;
}

/** `importFigmaFile` behind the loading screen, which covers the window until it's done. */
export function importFigmaWithLoading(path: string): Promise<FileInfo> {
  return runWithLoading(`Importing ${fileNameFromPath(path)}`, (report) =>
    importFigmaFile(path, report),
  );
}

/** Reports a stage, then waits a frame so the loading screen shows it before the work blocks. */
function step(report: ReportLoading, stage: string): Promise<void> {
  report(stage);
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
}

function summary(warnings: readonly string[]): string {
  const listed = warnings.slice(0, LISTED_WARNINGS).join("; ");
  const more = warnings.length - LISTED_WARNINGS;
  return more > 0 ? `${listed}; and ${more} more.` : `${listed}.`;
}
