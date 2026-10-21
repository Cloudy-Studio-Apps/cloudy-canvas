import { SECTION_COLORS } from "@board";
import { ColorSwatch, FloatingPanel } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "../../board-engine-context";

/** Background color for new sections; also recolors the selected sections. */
export function SectionOptions() {
  const engine = useBoardEngine();
  const sectionColor = useBoardState((state) => state.options.sectionColor);

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
