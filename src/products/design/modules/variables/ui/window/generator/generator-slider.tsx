import type { GeneratorSliderProps } from "./generator.types";

/** A labelled 0–1 setting shown as a percentage. */
export function GeneratorSlider({ label, value, min, max, step, onChange }: GeneratorSliderProps) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="flex justify-between text-muted-foreground">
        {label}
        <span className="tabular-nums">{Math.round(value * 100)}%</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}
