import { Signature, Spline } from "lucide-react";

import { OptionButton } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";

/** Freehand keeps the stroke as drawn; smooth cleans it up when it's finished. */
export function DrawModeButtons() {
  const engine = useBoardEngine();
  const drawSmooth = useBoardState((state) => state.options.drawSmooth);

  return (
    <>
      <OptionButton
        aria-label="Freehand"
        title="Freehand"
        selected={!drawSmooth}
        onClick={() => engine.setToolOptions({ drawSmooth: false })}
      >
        <Signature className="size-4" />
      </OptionButton>
      <OptionButton
        aria-label="Smooth"
        title="Smooth: strokes are smoothed when you finish them"
        selected={drawSmooth}
        onClick={() => engine.setToolOptions({ drawSmooth: true })}
      >
        <Spline className="size-4" />
      </OptionButton>
    </>
  );
}
