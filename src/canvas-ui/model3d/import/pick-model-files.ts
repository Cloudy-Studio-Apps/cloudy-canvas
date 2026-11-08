import { MODEL_EXTENSIONS, type ImportFile } from "@canvas";
import { openFile } from "@platform";
import { t } from "../model3d.i18n";

/**
 * Asks for a model file and reads it (desktop app only; `openFile` takes one file, textures next
 * to it on disk are found by the importer). `[]` when cancelled or outside the desktop app.
 */
export async function pickModelFiles(): Promise<ImportFile[]> {
  const file = await openFile({
    title: t("import.title"),
    filters: [{ name: t("import.filter"), extensions: [...MODEL_EXTENSIONS] }],
  });
  return file ? [{ name: file.name, path: file.path, data: file.bytes }] : [];
}
