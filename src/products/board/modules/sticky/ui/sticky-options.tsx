import { STICKY_COLORS } from "../../../palette";
import { FloatingPanel } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";

export function StickyOptions() {
  return (
    <FloatingPanel role="group" aria-label="Sticky note colors" className="gap-1 px-2">
      <BoardColorPalette option="stickyColor" colors={STICKY_COLORS} scopes={["shape-fill"]} />
    </FloatingPanel>
  );
}
