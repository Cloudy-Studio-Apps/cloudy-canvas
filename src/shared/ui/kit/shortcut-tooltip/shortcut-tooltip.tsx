import { Kbd } from "@shared/ui/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import type { ShortcutTooltipProps } from "./shortcut-tooltip.types";

/** A control's tooltip: its label, its shortcut as a key cap and a line under them. */
export function ShortcutTooltip({
  label,
  shortcut,
  description,
  side = "top",
  children,
}: ShortcutTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="flex max-w-56 flex-col items-start gap-0.5">
        <span className="flex items-center gap-2">
          {label}
          {shortcut && (
            <Kbd className="h-4 min-w-4 border-background/20 bg-transparent text-background/80">
              {shortcut}
            </Kbd>
          )}
        </span>
        {description && <span className="text-background/70">{description}</span>}
      </TooltipContent>
    </Tooltip>
  );
}
