import { STICKY_COLORS } from "@engine";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel } from "../floating-panel";
import { ColorSwatch } from "./color-swatch";

export function StickyOptions() {
  const engine = useEngine();
  const stickyColor = useEngineState((state) => state.options.stickyColor);

  return (
    <FloatingPanel role="group" aria-label="Sticky note colors" className="gap-1 px-2">
      {STICKY_COLORS.map((color) => (
        <ColorSwatch
          key={color.value}
          label={color.name}
          color={color.value}
          selected={stickyColor === color.value}
          onSelect={() => engine.setToolOptions({ stickyColor: color.value })}
        />
      ))}
    </FloatingPanel>
  );
}
