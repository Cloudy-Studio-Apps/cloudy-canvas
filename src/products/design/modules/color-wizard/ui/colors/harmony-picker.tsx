import { ChoiceCards } from "@shared/ui/kit";
import { HARMONIES, type HarmonyId } from "../..";
import type { HarmonyPickerProps } from "./colors.types";
import { HarmonyIcon } from "./harmony-icon";
import { t } from "../../color-wizard.i18n";

/** The harmonies as picture cards (Custom only where `custom` is offered). */
export function HarmonyPicker({ value, onChange, custom = true }: HarmonyPickerProps) {
  const options = HARMONIES.filter((h) => custom || h.id !== "custom").map((h) => ({
    value: h.id,
    label: h.label,
    picture: <HarmonyIcon harmony={h.id} />,
  }));
  return (
    <ChoiceCards<HarmonyId>
      label={t("harmonies.label")}
      value={value}
      onChange={onChange}
      options={options}
      columns={3}
    />
  );
}
