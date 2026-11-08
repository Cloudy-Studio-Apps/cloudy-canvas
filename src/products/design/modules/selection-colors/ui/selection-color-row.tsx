import { Target } from "lucide-react";

import { ColorField } from "@canvas-ui";
import { PanelIconButton } from "@design/ui/components/panel";
import type { SelectionColorRowProps } from "./selection-color-row.types";
import { t } from "../selection-colors.i18n";

/** One color of the selection: its field, and a button selecting the layers that use it. */
export function SelectionColorRow({ entry, onChange, onSelect }: SelectionColorRowProps) {
  return (
    <div className="flex items-center gap-1">
      <ColorField
        className="min-w-0 flex-1"
        color={entry.color}
        opacity={entry.opacity}
        label={t("section.color", { hex: entry.color.slice(1).toUpperCase() })}
        onChange={onChange}
      />
      <PanelIconButton label={t("section.selectUses")} onClick={onSelect}>
        <Target />
      </PanelIconButton>
    </div>
  );
}
