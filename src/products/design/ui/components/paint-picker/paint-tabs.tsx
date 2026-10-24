import { Grid2x2, Image } from "lucide-react";
import type { CSSProperties } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { cn } from "@shared/ui/lib/utils";
import type { PaintTab, PaintTabsProps } from "./paint-picker.types";
import { PAINT_TABS } from "./paint-tabs-data";

/** Each paint's glyph, drawn in the text color. */
const GLYPHS: Partial<Record<PaintTab["id"], CSSProperties>> = {
  solid: { background: "currentColor" },
  linear: { background: "linear-gradient(to right, currentColor, transparent)" },
  radial: { background: "radial-gradient(currentColor, transparent 75%)" },
  angular: { background: "conic-gradient(currentColor, transparent)" },
  diamond: {
    background:
      "linear-gradient(45deg, transparent 30%, currentColor 50%, transparent 70%), linear-gradient(-45deg, transparent 30%, currentColor 50%, transparent 70%)",
  },
};

/** The row of paint kinds; the ones not built yet are disabled. */
export function PaintTabs({ active, onPick, allowImage }: PaintTabsProps) {
  return (
    <div role="tablist" aria-label="Paint" className="flex items-center justify-between">
      {PAINT_TABS.map((tab) => ({
        ...tab,
        ready: tab.ready && (allowImage || tab.id !== "image"),
      })).map((tab) => (
        <Tooltip key={tab.id}>
          <TooltipTrigger asChild>
            {/* eslint-disable-next-line no-restricted-syntax -- bespoke: the paint picker's kind tabs */}
            <button
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              aria-label={tab.label}
              aria-disabled={!tab.ready}
              onClick={() => tab.ready && onPick(tab.id)}
              className={cn(
                "flex size-7 items-center justify-center rounded-sm text-muted-foreground",
                tab.ready ? "cursor-pointer hover:bg-hover hover:text-foreground" : "opacity-40",
                active === tab.id && "bg-muted text-foreground",
              )}
            >
              {tab.id === "image" ? (
                <Image className="size-3.5" />
              ) : tab.id === "pattern" ? (
                <Grid2x2 className="size-3.5" />
              ) : (
                <span className="size-3 rounded-xs border border-current" style={GLYPHS[tab.id]} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {tab.ready
              ? tab.label
              : tab.id === "image"
                ? "Strokes can't be images yet"
                : `${tab.label} (coming soon)`}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
