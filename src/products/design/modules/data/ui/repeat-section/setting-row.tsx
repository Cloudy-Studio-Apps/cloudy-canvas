import type { SettingRowProps } from "./setting-row.types";

/** A labelled row of the Repeat section: the label on the left, the control after it. */
export function SettingRow({ label, children }: SettingRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="w-24 shrink-0 truncate text-xs text-muted-foreground" title={label}>
        {label}
      </span>
      {children}
    </div>
  );
}
