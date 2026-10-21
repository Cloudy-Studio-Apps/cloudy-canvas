import type { ComponentProps, ReactNode } from "react";

import { Button } from "@ui/components/ui/button";
import { Kbd } from "@ui/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/components/ui/tooltip";
import { cn } from "@ui/lib/utils";

interface ToolButtonProps extends Omit<ComponentProps<typeof Button>, "children"> {
  label: string;
  shortcut?: string;
  active?: boolean;
  children: ReactNode;
  side?: "top" | "bottom";
}

/** Icon button with a tooltip showing its label and shortcut. */
export function ToolButton({
  label,
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
      <TooltipContent side={side} className="flex items-center gap-2">
        {label}
        {shortcut && (
          <Kbd className="h-4 min-w-4 border-background/20 bg-transparent text-background/80">
            {shortcut}
          </Kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
