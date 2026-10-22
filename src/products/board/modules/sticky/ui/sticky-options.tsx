import { STICKY_COLORS } from "@board";
import { ColorSwatch, FloatingPanel } from "@canvas-ui";
import { useBoardEngine, useBoardState } from "@board/ui/board-engine-context";

export function StickyOptions() {
  const engine = useBoardEngine();
  const stickyColor = useBoardState((state) => state.options.stickyColor);

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
