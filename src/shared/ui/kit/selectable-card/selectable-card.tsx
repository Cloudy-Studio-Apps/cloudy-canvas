import { Check } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { SelectableCardProps } from "./selectable-card.types";

/** A card picked out of a set: a picture, a title, a description, ticked when selected. */
export function SelectableCard({
  selected,
  onSelect,
  media,
  title,
  description,
  badge,
  comingSoon,
  disabled,
  className,
  ...props
}: SelectableCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled || comingSoon}
      onClick={onSelect}
      className={cn(
        "group/card relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-card border bg-surface text-left text-surface-foreground transition-[border-color,box-shadow] outline-none hover:border-border-strong focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60",
        selected && "border-primary ring-1 ring-primary hover:border-primary",
        className,
      )}
      {...props}
    >
      {media && <div className="border-b bg-surface-sunken">{media}</div>}
      <div className="flex min-w-0 flex-col gap-0.5 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium">{title}</span>
          {badge}
          {comingSoon && (
            <span className="rounded-xs bg-muted px-1 text-xs text-muted-foreground">Soon</span>
          )}
        </div>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      {selected && (
        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-sm bg-primary text-primary-foreground [&_svg]:size-3.5">
          <Check />
        </span>
      )}
    </button>
  );
}
