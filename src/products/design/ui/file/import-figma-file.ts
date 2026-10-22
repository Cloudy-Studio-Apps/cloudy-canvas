import { designMigrations, encodeDesignFile } from "@design";
import { readLocalFile, storage } from "@platform";
import { createId, fileNameFromPath, type FileInfo } from "@shared/core";
import { toast } from "@shared/stores/toast-store";
import { getDesignModules, getDesignProduct } from "../modules";

/** Most losses listed in the toast; the rest are summed up. */
const LISTED_WARNINGS = 4;

/**
 * Imports the Figma file at `path` as a new design, kept as a draft (Save asks where to put it),
 * named after the file. The importer loads only now, the first time a Figma file is opened.
 * What couldn't be brought over as it was is listed in a toast.
 */
export async function importFigmaFile(path: string): Promise<FileInfo> {
  const [{ figmaDesignDocument }, bytes] = await Promise.all([
    import("@design/figma"),
    readLocalFile(path),
  ]);
  const { doc, name, warnings } = figmaDesignDocument(
    bytes,
    getDesignProduct().kinds,
    getDesignModules().get(designMigrations),
  );
  const title = name ?? fileNameFromPath(path);
  doc.setMeta({ title });
  const file = await storage.saveDraft(
    createId(),
    title,
    "design",
    encodeDesignFile(doc.encode()),
    { title },
  );
  if (warnings.length > 0) {
    toast({ title: "Imported with changes", description: summary(warnings) });
  }
  return file;
}

function summary(warnings: readonly string[]): string {
  const listed = warnings.slice(0, LISTED_WARNINGS).join("; ");
  const more = warnings.length - LISTED_WARNINGS;
  return more > 0 ? `${listed}; and ${more} more.` : `${listed}.`;
}
