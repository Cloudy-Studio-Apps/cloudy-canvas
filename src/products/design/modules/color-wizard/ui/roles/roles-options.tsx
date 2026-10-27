import { CheckboxField } from "@shared/ui/kit";
import { useColorWizardStore } from "../store";
import type { RoleOption } from "./roles.types";
import { t } from "../../color-wizard.i18n";

const OPTIONS: readonly RoleOption[] = [
  {
    key: "shades",
    label: t("roles.options.shades"),
    hint: t("roles.options.shadesHint"),
  },
  {
    key: "neutral",
    label: t("roles.options.neutral"),
    hint: t("roles.options.neutralHint"),
  },
  {
    key: "status",
    label: t("roles.options.status"),
    hint: t("roles.options.statusHint"),
  },
];

/** What gets added to the palette. */
export function RolesOptions() {
  const options = useColorWizardStore((s) => s.options);
  const set = useColorWizardStore((s) => s.set);
  return (
    <div className="flex flex-col gap-3.5">
      <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {t("roles.options.title")}
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
