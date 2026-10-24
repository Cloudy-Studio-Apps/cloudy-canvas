import { Button } from "@shared/ui/kit";
import type { MaskSectionButtonProps } from "./mask-section-button.types";

/** A small text button in the Mask section's header. */
export function MaskSectionButton({ label, onClick }: MaskSectionButtonProps) {
  return (
    <Button variant="ghost" size="xs" onClick={onClick}>
      {label}
    </Button>
  );
}
