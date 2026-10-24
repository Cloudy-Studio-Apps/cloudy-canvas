import { Kbd } from "@shared/ui/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { cn } from "@shared/ui/lib/utils";
import type { IconButtonProps, IconButtonSize } from "./icon-button.types";

const SIZES: Record<IconButtonSize, string> = {
  xs: "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
  sm: "size-control-sm [&_svg:not([class*='size-'])]:size-4",
  md: "size-control [&_svg:not([class*='size-'])]:size-4",
  lg: "size-9 [&_svg:not([class*='size-'])]:size-[18px]",
};

/** A square button with an icon, its label in a tooltip (with its shortcut). */
export function IconButton({
  label,
  shortcut,
  description,
  active,
  size = "md",
  variant = "ghost",
  tooltip = "top",
  revealOnHover,
  className,
  children,
  ...props
}: IconButtonProps) {
  const button = (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors outline-none select-none hover:bg-hover hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 data-[state=open]:bg-hover data-[state=open]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        revealOnHover &&
          "opacity-0 group-focus-within:opacity-100 group-focus-within/row:opacity-100 group-hover:opacity-100 group-hover/row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
        variant === "outline" && "border border-border-strong bg-surface shadow-xs",
        active &&
          "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft hover:text-primary-soft-foreground",
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
  if (tooltip === false) return button;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={tooltip} className="flex max-w-56 flex-col items-start gap-0.5">
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
