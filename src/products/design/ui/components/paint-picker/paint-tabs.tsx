import { Grid2x2, Image } from "lucide-react";
import type { CSSProperties } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@shared/ui/components/ui/tooltip";
import { cn } from "@shared/ui/lib/utils";
import type { PaintTab, PaintTabsProps } from "./paint-picker.types";

const TABS: readonly PaintTab[] = [
  { id: "solid", label: "Solid", ready: true },
  { id: "linear", label: "Linear", ready: false },
  { id: "radial", label: "Radial", ready: false },
  { id: "angular", label: "Angular", ready: false },
  { id: "diamond", label: "Diamond", ready: false },
  { id: "image", label: "Image", ready: true },
  { id: "pattern", label: "Pattern", ready: false },
];

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
      {TABS.map((tab) => ({ ...tab, ready: tab.ready && (allowImage || tab.id !== "image") })).map(
        (tab) => (
          <Tooltip key={tab.id}>
            <TooltipTrigger asChild>
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
                  <span
                    className="size-3 rounded-xs border border-current"
                    style={GLYPHS[tab.id]}
                  />
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
        ),
      )}
    </div>
  );
}
