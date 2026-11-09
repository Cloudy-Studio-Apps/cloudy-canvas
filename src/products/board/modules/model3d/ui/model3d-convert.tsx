import { ConvertModelDialog, modelHeldNotice, useModelEditStore } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import { useBoardEngine } from "@board/ui/board-engine-context";
import { convertModelToImage } from "../convert-model";
import type { ModelElement } from "../model3d.types";
import { t } from "../model3d.i18n";
import { useConvertStore } from "./convert-store";

/** Asks before converting a model to a PNG image, then converts it and selects the image. */
export function Model3dConvert() {
  const engine = useBoardEngine();
  const id = useConvertStore((state) => state.id);
  const close = useConvertStore((state) => state.close);

  const convert = async () => {
    if (!id) return;
    try {
      // The unfinished edit (the panel's changes) is written first, so the picture is current.
      await useModelEditStore.getState().stopIn(engine);
      const el = engine.getElement(id);
      if (el?.type !== "model3d" || modelHeldNotice(engine, id)) return;
      engine.select([convertModelToImage(engine, el as ModelElement)]);
    } catch (error) {
      notifyError(t("convert.failed"), error);
    }
  };

  return (
    <ConvertModelDialog
      open={id !== null}
      onOpenChange={(open) => !open && close()}
      onConfirm={() => void convert()}
    />
  );
}
