import type { PresetRowProps } from "./preset-row.types";

/** A row of preset buttons over an editor's fields. */
export function PresetRow({ label, presets, onPick }: PresetRowProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="mr-auto text-xs text-muted-foreground">{label}</span>
      {presets.map((preset, i) => (
        // eslint-disable-next-line no-restricted-syntax -- bespoke: a tiny preset chip
        <button
          key={preset.label}
          type="button"
          onClick={() => onPick(i)}
          className="h-6 min-w-6 cursor-pointer rounded-sm bg-muted px-1.5 text-xs text-muted-foreground hover:bg-hover hover:text-foreground"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
