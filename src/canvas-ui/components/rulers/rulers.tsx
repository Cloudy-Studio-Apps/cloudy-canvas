import { useLayoutEffect, useRef, useState } from "react";

import { onThemeChange } from "@shared/ui/theme";
import { useEngine, useEngineState } from "../../engine-context";
import { readRulerColors } from "./read-ruler-colors";
import { RulerStrip } from "./ruler-strip";
import type { RulerColors } from "./rulers.types";
import { useRulerVersion } from "./use-ruler-version";

/**
 * The rulers along the canvas's top and left edges (`RULER_SIZE` thick), in world units, with the
 * selection's extent marked; guides are dragged out of them. Laid over the canvas exactly (its
 * container's top-left corner) while the engine says they're shown (`EngineState.rulersShown`).
 */
export function Rulers() {
  const engine = useEngine();
  const shown = useEngineState((state) => state.rulersShown);
  const version = useRulerVersion();
  const ref = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<RulerColors | null>(null);

  useLayoutEffect(() => {
    if (!shown) return;
    const read = () => {
      if (ref.current) setColors(readRulerColors(ref.current));
    };
    read();
    return onThemeChange(read);
  }, [shown]);

  if (!shown || !engine.hasGuides) return null;
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {colors && (
        <div className="pointer-events-auto">
          <RulerStrip axis="x" version={version} colors={colors} />
          <RulerStrip axis="y" version={version} colors={colors} />
          <div
            className="absolute top-0 left-0 size-5 border-r border-b"
            style={{ background: colors.background, borderColor: colors.border }}
          />
        </div>
      )}
    </div>
  );
}
