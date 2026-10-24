import type * as React from "react";

export interface CheckboxProps extends Omit<
  React.ComponentProps<"button">,
  "onChange" | "value" | "children"
> {
  /** `"mixed"` for a selection whose values differ. */
  checked: boolean | "mixed";
  onCheckedChange: (checked: boolean) => void;
  /** Shown after the box, clicking it toggles too. */
  label?: React.ReactNode;
}
