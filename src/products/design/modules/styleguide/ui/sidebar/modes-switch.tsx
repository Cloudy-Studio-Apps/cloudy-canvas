import { SwitchField } from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";

/** The view's "every mode side by side" switch. */
export function ModesSwitch() {
  const { styleguide } = useStyleguide();
  return (
    <SwitchField
      label="Show modes side by side"
      checked={styleguide.settings().modeView === "all"}
      onChange={(on) => styleguide.setModeView(on ? "all" : "current")}
    />
  );
}
