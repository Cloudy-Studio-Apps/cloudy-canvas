import { Palette } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";

/** The top bar's button that shows the board's colors in the side panel. */
export function ColorsButton() {
  const colorsOpen = useBoardPanelStore((state) => state.colorsOpen);
  const setColorsOpen = useBoardPanelStore((state) => state.setColorsOpen);
  return (
    <ToolButton
      label="Board colors"
      side="bottom"
      active={colorsOpen}
      onClick={() => setColorsOpen(!colorsOpen)}
    >
      <Palette />
    </ToolButton>
  );
}
