import { SegmentedControl, SwitchField } from "@shared/ui/kit";
import { DEFAULT_OVERLAY } from "../../model";
import { OVERLAY_POSITIONS } from "../../prototype.constants";
import { t } from "../../prototype.i18n";
import { InteractionRow } from "./interaction-row";
import type { InteractionFieldsProps } from "./interaction-fields.types";

const POSITION_CHOICES = OVERLAY_POSITIONS.map((value) => ({
  value,
  label: t(`position.${value}`),
}));

/** Where an overlay (or swap) sits, whether a click outside closes it and whether it dims. */
export function OverlayFields({ ix, onChange }: InteractionFieldsProps) {
  const overlay = ix.overlay ?? DEFAULT_OVERLAY;
  return (
    <div className="flex flex-col gap-2 border-t pt-2">
      <InteractionRow label={t("card.position")}>
        <SegmentedControl
          label={t("card.position")}
          size="sm"
          fullWidth
          value={overlay.position}
          options={POSITION_CHOICES}
          onChange={(position) => onChange({ overlay: { ...overlay, position } })}
        />
      </InteractionRow>
      <SwitchField
        label={t("card.closeOutside")}
        checked={overlay.closeOutside}
        onChange={(closeOutside) => onChange({ overlay: { ...overlay, closeOutside } })}
      />
      <SwitchField
        label={t("card.dim")}
        checked={overlay.dim}
        onChange={(dim) => onChange({ overlay: { ...overlay, dim } })}
      />
    </div>
  );
}
