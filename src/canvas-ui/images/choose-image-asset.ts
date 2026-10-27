import type { CanvasEngine } from "@canvas";
import { pickImageFiles } from "@platform";
import { createId } from "@shared/core";
import { notifyError } from "@shared/stores/toast-store";
import type { ChooseImageOptions } from "./choose-image-asset.types";
import { t } from "./images.i18n";

/**
 * Asks for one picture and adds it to the document's assets: its asset id, or `null` when the
 * dialog was cancelled or the file couldn't be read (said in a toast).
 */
export async function chooseImageAsset(
  engine: CanvasEngine,
  { title, errorTitle = t("error") }: ChooseImageOptions,
): Promise<string | null> {
  try {
    const [file] = await pickImageFiles({ title, multiple: false });
    if (!file) return null;
    const assetId = createId();
    engine.doc.addAsset(assetId, file.data);
    return assetId;
  } catch (error) {
    notifyError(errorTitle, error);
    return null;
  }
}
