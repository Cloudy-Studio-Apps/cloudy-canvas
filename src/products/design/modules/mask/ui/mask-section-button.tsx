import type { MaskSectionButtonProps } from "./mask-section-button.types";

/** A small text button in the Mask section's header. */
export function MaskSectionButton({ label, onClick }: MaskSectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-6 cursor-pointer items-center rounded-sm px-1.5 text-xs text-muted-foreground hover:bg-hover hover:text-foreground"
    >
      {label}
    </button>
  );
}
