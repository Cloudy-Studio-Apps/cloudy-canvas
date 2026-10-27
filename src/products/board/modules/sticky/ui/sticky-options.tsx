import { STICKY_COLORS } from "../../../palette";
import { FloatingPanel } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";
import { t } from "../sticky.i18n";

export function StickyOptions() {
  return (
    <FloatingPanel role="group" aria-label={t("colorsGroup")} className="gap-1 px-2">
      <BoardColorPalette option="stickyColor" colors={STICKY_COLORS} scopes={["shape-fill"]} />
    </FloatingPanel>
  );
}
