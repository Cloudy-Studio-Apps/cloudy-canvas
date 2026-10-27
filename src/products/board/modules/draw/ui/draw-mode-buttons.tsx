import { Signature, Spline } from "lucide-react";

import { OptionButton } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";
import { t } from "../draw.i18n";

/** Freehand keeps the stroke as drawn; smooth cleans it up when it's finished. */
export function DrawModeButtons() {
  const engine = useBoardEngine();
  const drawSmooth = useBoardState((state) => state.options.drawSmooth);

  return (
    <>
      <OptionButton
        aria-label={t("options.freehand")}
        title={t("options.freehand")}
        selected={!drawSmooth}
        onClick={() => engine.setToolOptions({ drawSmooth: false })}
      >
        <Signature className="size-4" />
      </OptionButton>
      <OptionButton
        aria-label={t("options.smooth")}
        title={t("options.smoothHint")}
        selected={drawSmooth}
        onClick={() => engine.setToolOptions({ drawSmooth: true })}
      >
        <Spline className="size-4" />
      </OptionButton>
    </>
  );
}
