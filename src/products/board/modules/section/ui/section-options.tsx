import { SECTION_COLORS } from "@board";
import { ColorPalette, FloatingPanel } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

/** Background color for new sections; also recolors the selected sections. */
export function SectionOptions() {
  const engine = useBoardEngine();
  const sectionColor = useBoardState((state) => state.options.sectionColor);

  return (
    <FloatingPanel role="group" aria-label="Section colors" className="gap-1 px-2">
      <ColorPalette
        colors={SECTION_COLORS}
        value={sectionColor}
        onSelect={(color) => engine.setToolOptions({ sectionColor: color })}
      />
    </FloatingPanel>
  );
}
