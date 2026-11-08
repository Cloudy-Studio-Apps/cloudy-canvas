import { TEXT_COLORS } from "../../../palette";
import { FloatingPanel, PanelDivider, useEngineState } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";
import { TextSizeControls } from "./text-size-controls";
import { TextStyleButtons } from "./text-style-buttons";
import { TextWidthButton } from "./text-width-button";
import { t } from "../text.i18n";

/**
 * Size, style, alignment and color for new text; also restyles the selected labels, and switches
 * them between auto width and fixed width.
 */
export function TextOptions() {
  const selecting = useEngineState((state) => state.tool) === "select";

  return (
    <FloatingPanel
      role="group"
      aria-label={t("options.group")}
      className="gap-1 px-2"
      scrollsOnPhones
    >
      <TextSizeControls />
      <PanelDivider />
      <TextStyleButtons />
      {selecting && <TextWidthButton />}
      <PanelDivider />
      <BoardColorPalette
        option="textColor"
        colors={TEXT_COLORS}
        scopes={["text-fill"]}
        shape="circle"
        labelOf={(color) => t("options.colorLabel", { color: color.name })}
      />
    </FloatingPanel>
  );
}
