import { Button } from "@ui/components/ui/button";
import type { SegmentedProps } from "./segmented.types";

/** Two-way choice (e.g. overlapping / exclusive) as a pair of buttons. */
export function Segmented({ value, off, on, onChange, ...props }: SegmentedProps) {
  return (
    <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label={props["aria-label"]}>
      {[
        { option: off, checked: !value, next: false },
        { option: on, checked: value, next: true },
      ].map(({ option, checked, next }) => (
        <Button
          key={option.label}
          variant={checked ? "secondary" : "ghost"}
          size="sm"
          role="radio"
          aria-checked={checked}
          title={option.title}
          onClick={() => onChange(next)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
