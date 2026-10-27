import { SECTION_COLORS } from "../../../palette";
import { FloatingPanel } from "@canvas-ui";
import { BoardColorPalette } from "@board/ui/components/board-colors";
import { t } from "../section.i18n";

/** Background color for new sections; also recolors the selected sections. */
export function SectionOptions() {
  return (
    <FloatingPanel role="group" aria-label={t("colors.group")} className="gap-1 px-2">
      <BoardColorPalette option="sectionColor" colors={SECTION_COLORS} scopes={["frame-fill"]} />
    </FloatingPanel>
  );
}
