import type { ToggleProps } from "./sidebar.types";

/** A labelled checkbox for one of the brochure's settings. */
export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(!checked)}
        className="accent-primary"
      />
      {label}
    </label>
  );
}
