import { Button } from "@shared/ui/components/ui/button";
import { Kbd } from "@shared/ui/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { cn } from "@shared/ui/lib/utils";
import type { ToolButtonProps } from "./tool-button.types";

/** Icon button with a tooltip showing its label, shortcut and (optionally) a description. */
export function ToolButton({
  label,
  description,
  shortcut,
  active,
  className,
  side = "top",
  children,
  ...props
}: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "size-9 [&_svg:not([class*='size-'])]:size-[18px]",
            active &&
              "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft hover:text-primary-soft-foreground",
            className,
          )}
          {...props}
        >
          {children}
        </Button>
      </TooltipTrigger>
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
