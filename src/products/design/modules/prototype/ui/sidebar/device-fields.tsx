import { useService } from "@canvas-ui";
import { SegmentedControl, SelectField } from "@shared/ui/kit";
import { DESIGN_PROTOTYPE, PROTOTYPE_DEVICES } from "../../model";
import type { PrototypeOrientation, PrototypePlatform } from "../../model";
import { PROTOTYPE_PLATFORMS } from "../../prototype.constants";
import { t } from "../../prototype.i18n";
import { PLATFORM_ICONS } from "../flows-tab/platform-icons";
import { deviceLabel } from "./device-label";
import type { DeviceFieldsProps } from "./device-fields.types";

const PLATFORM_OPTIONS = PROTOTYPE_PLATFORMS.map((value) => {
  const Icon = PLATFORM_ICONS[value];
  return { value, label: t(`platform.${value}`), icon: <Icon /> };
});

const ORIENTATIONS: readonly PrototypeOrientation[] = ["portrait", "landscape"];

/** A flow's platform, device and (for a phone or tablet) orientation, with what the platform plays in. */
export function DeviceFields({ flow }: DeviceFieldsProps) {
  const prototype = useService(DESIGN_PROTOTYPE);
  const held = flow.platform === "mobile" || flow.platform === "tablet";
  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl<PrototypePlatform>
        label={t("device.platform")}
        value={flow.platform}
        options={PLATFORM_OPTIONS}
        fullWidth
        onChange={(platform) => prototype.updateFlow(flow.id, { platform })}
      />
      <SelectField
        label={t("device.device")}
        value={flow.device}
        options={PROTOTYPE_DEVICES[flow.platform].map((value) => ({
          value,
          label: deviceLabel(value),
        }))}
        onChange={(device) => prototype.updateFlow(flow.id, { device })}
      />
      {held && (
        <SegmentedControl<PrototypeOrientation>
          label={t("device.orientation")}
          value={flow.orientation}
          options={ORIENTATIONS.map((value) => ({ value, label: t(`device.${value}`) }))}
          fullWidth
          onChange={(orientation) => prototype.updateFlow(flow.id, { orientation })}
        />
      )}
      <p className="text-xs text-muted-foreground">{t(`device.note.${flow.platform}`)}</p>
    </div>
  );
}
