import type { EffectToggleProps } from "./fields.types";

/** A labeled checkbox of an effect's editor. */
export function EffectToggle({ label, checked, onChange }: EffectToggleProps) {
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
