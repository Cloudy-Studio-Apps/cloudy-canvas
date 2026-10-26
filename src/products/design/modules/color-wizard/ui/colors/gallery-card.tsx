import { Copy, Heart } from "lucide-react";

import { cn, IconButton } from "@shared/ui/kit";
import { onColor } from "../..";
import { copyText } from "../copy-text";
import type { GalleryCardProps } from "./colors.types";

/** A palette as stripes (the hex shows on a hovered one), its category, save and copy. */
export function GalleryCard({
  colors,
  label,
  picked,
  saved,
  onUse,
  onToggleSaved,
}: GalleryCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-popover",
        picked && "ring-2 ring-primary ring-offset-1 ring-offset-surface",
      )}
    >
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the stripes are the card's big click target */}
      <button
        type="button"
        aria-label="Use this palette"
        onClick={onUse}
        className="flex h-21 w-full cursor-pointer"
      >
        {colors.map((hex) => (
          <span
            key={hex}
            className="group/stripe relative flex flex-1 items-end p-1.5 transition-[flex] hover:flex-[1.8]"
            style={{ background: hex, color: onColor(hex) }}
          >
            <span className="hidden text-[10px] font-semibold group-hover/stripe:inline">
              {hex}
            </span>
          </span>
        ))}
      </button>
      <div className="flex items-center gap-0.5 py-1 pr-1 pl-2.5 text-xs text-muted-foreground">
        <span className="flex-1">{label}</span>
        <IconButton
          label={saved ? "Remove from favorites" : "Save to favorites"}
          size="xs"
          active={saved}
          onClick={onToggleSaved}
          className={cn(saved && "text-destructive [&_svg]:fill-current")}
        >
          <Heart />
        </IconButton>
        <IconButton
          label="Copy hex codes"
          size="xs"
          onClick={() => copyText(colors.join(", "), "Hex codes")}
        >
          <Copy />
        </IconButton>
      </div>
    </div>
  );
}
