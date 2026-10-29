import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/kit";
import type { TitlePopoverProps } from "./brand-bar.types";

/** The board's title; clicked, its title and description as plain text (nothing to edit). */
export function TitlePopover({ meta }: TitlePopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the title is the trigger, as text */}
        <button
          type="button"
          className="max-w-64 truncate rounded-md px-1 text-sm font-medium hover:bg-accent"
        >
          {meta.title}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 rounded-lg p-3">
        <p className="text-sm font-medium break-words">{meta.title}</p>
        {meta.description && (
          <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
            {meta.description}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
