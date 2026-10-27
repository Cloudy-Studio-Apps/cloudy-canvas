import { Palette } from "lucide-react";

import { ToolButton } from "@canvas-ui";
import { useBoardPanelStore } from "@board/ui/stores/board-panel-store";
import { t } from "../colors.i18n";

/** The top bar's button that shows the board's colors in the side panel. */
export function ColorsButton() {
  const colorsOpen = useBoardPanelStore((state) => state.colorsOpen);
  const setColorsOpen = useBoardPanelStore((state) => state.setColorsOpen);
  return (
    <ToolButton
      label={t("title")}
      side="bottom"
      active={colorsOpen}
      onClick={() => setColorsOpen(!colorsOpen)}
    >
      <Palette />
    </ToolButton>
  );
}
