import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@shared/ui/components/ui/popover";
import { FontList } from "./font-list";
import type { FontPickerProps } from "./font-picker.types";
import { useFontFamilies } from "./use-font-families";

/** The family field: opens a searchable list of installed and Google fonts. */
export function FontPicker({ family, onPick }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const families = useFontFamilies();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a select-like trigger in a FieldBox look */}
        <button
          type="button"
          aria-label="Font"
          className="flex h-7 w-full min-w-0 cursor-pointer items-center justify-between gap-1 rounded-sm border border-transparent bg-muted px-2 text-xs text-foreground hover:border-border data-[state=open]:border-ring"
        >
          <span className="truncate">{family ?? "Mixed"}</span>
          <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" sideOffset={16} className="w-auto p-0">
        {families ? (
          <FontList
            families={families}
            current={family}
            onPick={(picked) => {
              onPick(picked);
              setOpen(false);
            }}
          />
        ) : (
          <p className="w-64 p-4 text-center text-xs text-muted-foreground">Loading fonts…</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
