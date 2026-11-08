import { asUndoStep } from "@canvas";
import { importModelFiles, pickModelFiles } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import type { BoardEngine } from "../../../board-engine.types";
import { createModel } from "../model3d.factory";
import { t } from "../model3d.i18n";

/** Asks for a model file and places it in the middle of the view, selected. */
export async function placeModelFile(engine: BoardEngine): Promise<void> {
  try {
    const files = await pickModelFiles();
    if (files.length === 0) return;
    const { doc } = engine;
    const result = await importModelFiles(files, engine.visibleWorldRect(), createModel, doc, () =>
      doc.nextIndex(),
    );
    if (result.elements.length === 0) return;
    asUndoStep(doc, () => result.elements.forEach((el) => doc.add(el)));
    engine.select(result.elements.map((el) => el.id));
  } catch (error) {
    notifyError(t("place.failed"), error);
  }
}
