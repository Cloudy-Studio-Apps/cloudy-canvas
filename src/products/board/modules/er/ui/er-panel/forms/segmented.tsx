import { SegmentedControl } from "@shared/ui/kit";
import type { SegmentedProps } from "./segmented.types";

/** Two-way choice (e.g. overlapping / exclusive), the kit's `SegmentedControl` over a boolean. */
export function Segmented({ value, off, on, onChange, ...props }: SegmentedProps) {
  return (
    <SegmentedControl
      label={props["aria-label"]}
      value={value ? "on" : "off"}
      onChange={(next) => onChange(next === "on")}
      options={[
        { value: "off", label: off.label, title: off.title },
        { value: "on", label: on.label, title: on.title },
      ]}
      size="sm"
      fullWidth
    />
  );
}
