import { ChevronRight } from "lucide-react";

import { cn } from "@shared/ui/lib/utils";
import type { FramePresetGroupProps } from "./frame-preset-group.types";

/** One group of presets (Phone, Tablet, …): a heading that opens it, then a row per size. */
export function FramePresetGroup({
  group,
  open,
  onToggle,
  current,
  onPick,
}: FramePresetGroupProps) {
  return (
    <li>
      {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a preset row with its size */}
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex h-8 w-full cursor-pointer items-center gap-1 rounded-sm px-1.5 text-left text-xs font-semibold text-foreground hover:bg-hover"
      >
        <ChevronRight
          className={cn("size-3 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        {group.group}
      </button>
      {open && (
        <ul className="pb-1">
          {group.presets.map((preset) => (
            <li key={preset.id}>
              {/* eslint-disable-next-line no-restricted-syntax -- bespoke: a preset row with its size */}
              <button
                type="button"
                onClick={() => onPick(preset)}
                className={cn(
                  "flex h-7 w-full cursor-pointer items-center justify-between rounded-sm pr-2 pl-6 text-left text-xs text-foreground hover:bg-hover",
                  preset.id === current &&
                    "bg-primary-soft text-primary-soft-foreground hover:bg-primary-soft",
                )}
              >
                <span className="truncate">{preset.label}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {preset.size.w}×{preset.size.h}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
