import { CheckboxField } from "@shared/ui/kit";
import { useColorWizardStore } from "../store";
import type { RoleOption } from "./roles.types";

const OPTIONS: readonly RoleOption[] = [
  {
    key: "shades",
    label: "Shades 50–950",
    hint: "Eleven steps per color, kept linked to it: edit the color later and its shades follow.",
  },
  {
    key: "neutral",
    label: "Add a neutral",
    hint: "A gray tinted with the primary's hue, when no color is one.",
  },
  {
    key: "status",
    label: "Status colors",
    hint: "Success, warning, error and info, nudged toward your primary so they belong to the palette.",
  },
];

/** What gets added to the palette. */
export function RolesOptions() {
  const options = useColorWizardStore((s) => s.options);
  const set = useColorWizardStore((s) => s.set);
  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        Options
      </span>
      {OPTIONS.map((o) => (
        <div key={o.key} className="flex flex-col gap-0.5">
          <CheckboxField
            label={o.label}
            checked={options[o.key]}
            onChange={(checked) => set({ options: { ...options, [o.key]: checked } })}
          />
          <p className="pl-6 text-xs text-muted-foreground">{o.hint}</p>
        </div>
      ))}
    </div>
  );
}
