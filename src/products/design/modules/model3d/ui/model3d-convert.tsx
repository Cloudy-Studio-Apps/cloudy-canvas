import { ConvertModelDialog, useModelEditStore } from "@canvas-ui";
import { notifyError } from "@shared/stores/toast-store";
import { useDesignEngine } from "@design/ui/design-engine-context";
import { convertModelToRectangle } from "../convert-model";
import type { ModelNodeElement } from "../model3d.types";
import { t } from "../model3d.i18n";
import { useConvertStore } from "./convert-store";

/** Asks before converting a model to a PNG rectangle, then converts it and selects the result. */
export function Model3dConvert() {
  const engine = useDesignEngine();
  const id = useConvertStore((state) => state.id);
  const close = useConvertStore((state) => state.close);

  const convert = async () => {
    if (!id) return;
    try {
      // The unfinished edit (the panel's changes) is written first, so the picture is current.
      await useModelEditStore.getState().stopIn(engine);
      const el = engine.getElement(id);
      if (el?.type !== "model3d") return;
      engine.select([convertModelToRectangle(engine, el as ModelNodeElement)]);
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
