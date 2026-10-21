import { SECTION_COLORS } from "@engine";
import { useEngine, useEngineState } from "../../engine/engine-context";
import { FloatingPanel } from "../floating-panel";
import { ColorSwatch } from "./color-swatch";

/** Background color for new sections; also recolors the selected sections. */
export function SectionOptions() {
  const engine = useEngine();
  const sectionColor = useEngineState((state) => state.options.sectionColor);

  return (
    <FloatingPanel role="group" aria-label="Section colors" className="gap-1 px-2">
      {SECTION_COLORS.map((color) => (
        <ColorSwatch
          key={color.value}
          label={color.name}
          color={color.value}
          selected={sectionColor === color.value}
          onSelect={() => engine.setToolOptions({ sectionColor: color.value })}
        />
      ))}
    </FloatingPanel>
  );
}
