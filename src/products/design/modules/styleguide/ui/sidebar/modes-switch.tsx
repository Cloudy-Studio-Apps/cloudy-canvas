import { Switch } from "@shared/ui/kit";
import { useStyleguide } from "../hooks/use-styleguide";

/** The view's "every mode side by side" switch. */
export function ModesSwitch() {
  const { styleguide } = useStyleguide();
  const all = styleguide.settings().modeView === "all";
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      Show modes side by side
      <Switch
        checked={all}
        onCheckedChange={(on) => styleguide.setModeView(on ? "all" : "current")}
      />
    </label>
  );
}
