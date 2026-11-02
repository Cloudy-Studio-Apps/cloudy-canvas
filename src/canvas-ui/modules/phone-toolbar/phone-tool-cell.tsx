import { Button } from "@shared/ui/kit";
import { cn } from "@shared/ui/lib/utils";
import type { PhoneToolCellProps } from "./phone-toolbar.types";

/** One tool in the phone's tool sheet: its icon over its name, as there are no tooltips to read. */
export function PhoneToolCell({ icon, label, active, className, ...props }: PhoneToolCellProps) {
  return (
    <Button
      variant="ghost"
      aria-pressed={active}
      className={cn(
        "h-auto min-w-0 flex-col gap-1 px-1 py-2 text-xs font-normal",
        active && "bg-primary-soft text-primary-soft-foreground",
        className,
      )}
      {...props}
    >
      {icon}
      <span className="w-full truncate">{label}</span>
    </Button>
  );
}
