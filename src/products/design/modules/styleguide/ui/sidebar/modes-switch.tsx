import { SwitchField } from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";
import { t } from "../../styleguide.i18n";

/** The view's "every mode side by side" switch. */
export function ModesSwitch() {
  const { styleguide } = useStyleguide();
  return (
    <SwitchField
      label={t("sidebar.modesSwitch")}
      checked={styleguide.settings().modeView === "all"}
      onChange={(on) => styleguide.setModeView(on ? "all" : "current")}
    />
  );
}
