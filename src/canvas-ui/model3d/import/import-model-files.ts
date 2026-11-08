import {
  fitInView,
  MODEL_BASE_SIZE,
  MODEL_SIZE_WARNING_BYTES,
  PASTE_STEP,
  storeModel,
} from "@canvas";
import type { CanvasDocument, FileImportResult, ImportFile, ModelImport, Rect } from "@canvas";
import { notifyError } from "@shared/stores/toast-store";

import { modelBaker } from "../bake";
import { isModelFileName, siblingReader } from "../load";
import { t } from "../model3d.i18n";
import { companionNames } from "./claimed-files";
import { confirmModelSize } from "./confirm-model-size";
import type { PlaceModel } from "./import-model-files.types";

/**
 * Imports the model files among `files` (the rest are textures and companions for them, or not
 * ours): for each, reads it, asks to continue when it is big, bakes its first picture at the size
 * it will have, stores the assets and makes the element with `place`. The element is centered in
 * `view`, each next model a paste step further. A model that fails to import gets an error toast
 * and nothing is added. Every model, its used companions and the failed ones are claimed.
 */
export async function importModelFiles(
  files: readonly ImportFile[],
  view: Rect,
  place: PlaceModel,
  doc: CanvasDocument,
  nextIndex: () => string,
): Promise<FileImportResult> {
  const models = files.filter((file) => isModelFileName(file.name));
  if (models.length === 0) return { elements: [], claimed: [] };
  const others = files.filter((file) => !isModelFileName(file.name));
  const result: FileImportResult = { elements: [], claimed: models.map((file) => file.name) };
  for (const main of models) {
    const step = result.elements.length * PASTE_STEP;
    const at = { ...view, x: view.x + step, y: view.y + step };
    try {
      const imp = await modelBaker.importModel(main, others, siblingReader(main.path));
      result.claimed.push(...companionNames(imp, others));
      if (imp.totalBytes > MODEL_SIZE_WARNING_BYTES) {
        if (!(await confirmModelSize(main.name, imp.totalBytes))) continue;
      }
      result.elements.push(await build(imp, at, place, doc, nextIndex));
    } catch (error) {
      notifyError(t("import.error", { name: main.name }), error);
    }
  }
  return result;
}

async function build(
  imp: ModelImport,
  view: Rect,
  place: PlaceModel,
  doc: CanvasDocument,
  nextIndex: () => string,
) {
  const rect = fitInView({ w: MODEL_BASE_SIZE * imp.aspect, h: MODEL_BASE_SIZE }, view, 0.8);
  return place(await storeModel(modelBaker, imp, rect, doc), rect, nextIndex());
}
