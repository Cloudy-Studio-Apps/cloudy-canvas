import type { SettingsRowProps } from "./settings-row.types";

/** A labeled row of the stroke settings: its name left, its control right. */
export function SettingsRow({ label, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
