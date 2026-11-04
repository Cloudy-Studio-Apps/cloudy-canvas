import { ElementThumbnail } from "@canvas-ui";
import type { MasterSideThumbProps } from "./masters-section.types";
import { t } from "../../catalog.i18n";

/** One side of a master in its row: its frame's picture, or an empty box when it's gone. */
export function MasterSideThumb({ frame, label }: MasterSideThumbProps) {
  if (frame === null) {
    return (
      <span
        title={t("masters.noSide")}
        className="h-10 w-7 shrink-0 rounded-xs border border-dashed border-border-strong bg-surface"
      />
    );
  }
  return (
    <span title={label} className="shrink-0">
      <ElementThumbnail id={frame} className="h-10 w-7" />
    </span>
  );
}
