import { Button } from "@shared/ui/kit";
import type { IconActionProps } from "./icon-action.types";

/** A small icon button for row actions; `label` is its tooltip and accessible name. */
export function IconAction({ label, danger, disabled, onClick, children }: IconActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={danger ? "size-7 hover:text-destructive" : "size-7"}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
