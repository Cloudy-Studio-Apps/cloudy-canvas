import { useScrubUndo } from "@canvas-ui";
import { NumberInput } from "@shared/ui/kit";
import type { NumberFieldProps } from "./number-field.types";

/**
 * A compact number box (X 120), the kit's `NumberInput`: drag its prefix sideways to scrub the
 * value (one undo step for the whole drag), Up/Down step it, or type a value or arithmetic
 * (Enter or blur commits, Escape reverts). Shows "Mixed" when the selection's values differ.
 */
export function NumberField({ onCommit, ...props }: NumberFieldProps) {
  const undo = useScrubUndo();
  return <NumberInput {...props} {...undo} onChange={(value) => onCommit(value)} />;
}
