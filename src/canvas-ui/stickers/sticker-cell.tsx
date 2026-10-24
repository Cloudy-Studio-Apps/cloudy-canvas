import { X } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { StickerCellProps } from "./sticker-picker.types";

/** One sticker in the picker's grid. */
export function StickerCell({ sticker, active, onPick, onRemove }: StickerCellProps) {
  return (
    <div className="group relative">
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a sticker picture in the picker grid */}
      <button
        type="button"
        title={sticker.label}
        aria-label={sticker.label}
        aria-pressed={active}
        onClick={() => onPick(sticker)}
        className={cn(
          "flex size-10 cursor-pointer items-center justify-center rounded-md transition-colors outline-none hover:bg-hover focus-visible:ring-[3px] focus-visible:ring-ring/40",
          active && "bg-primary-soft hover:bg-primary-soft",
        )}
      >
        <img
          src={sticker.url}
          alt=""
          loading="lazy"
          draggable={false}
          className="size-8 object-contain transition-transform group-hover:scale-110"
        />
      </button>
      {onRemove && (
        // eslint-disable-next-line no-restricted-syntax -- bespoke: a sticker picture in the picker grid
        <button
          type="button"
          title={`Remove "${sticker.label}"`}
          aria-label={`Remove "${sticker.label}"`}
          onClick={() => onRemove(sticker)}
          className="absolute -top-1 -right-1 hidden size-4 cursor-pointer items-center justify-center rounded-sm border bg-surface text-muted-foreground shadow-xs group-hover:flex hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
