import { useScrubUndo } from "@canvas-ui";
import { NumberInput } from "@shared/ui/kit";
import type { ScrubFieldProps } from "./fields.types";

/**
 * An effect editor's number field, the kit's `NumberInput`: its label scrubs (Shift: ten times
 * faster), Up/Down step it, or type a value. A drag reports `{ done: false }` steps and
 * `{ done: true }` on release.
 */
export function ScrubField(props: ScrubFieldProps) {
  const undo = useScrubUndo();
  return <NumberInput {...undo} {...props} />;
}
