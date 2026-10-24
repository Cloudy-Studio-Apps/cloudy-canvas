import { STICKY_COLORS } from "@board";
import { ColorPalette, FloatingPanel } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

export function StickyOptions() {
  const engine = useBoardEngine();
  const stickyColor = useBoardState((state) => state.options.stickyColor);

  return (
    <FloatingPanel role="group" aria-label="Sticky note colors" className="gap-1 px-2">
      <ColorPalette
        colors={STICKY_COLORS}
        value={stickyColor}
        onSelect={(color) => engine.setToolOptions({ stickyColor: color })}
      />
    </FloatingPanel>
  );
}
