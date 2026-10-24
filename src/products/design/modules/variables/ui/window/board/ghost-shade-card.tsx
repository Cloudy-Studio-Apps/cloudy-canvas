import { cn } from "@shared/ui/lib/utils";
import type { GhostShadeCardProps } from "./board.types";
import { SwatchHalves } from "./swatch-halves";

const TAGS = { new: "new", update: "update", base: "base" } as const;

/** A shade the generator is about to write, dashed, with what it does to the group. */
export function GhostShadeCard({ shade, colors, state }: GhostShadeCardProps) {
  return (
    <div className="overflow-hidden rounded-card border border-dashed border-primary opacity-90">
      <SwatchHalves colors={colors} />
      <div className="px-2 py-1.5">
        <b className="block truncate text-xs font-medium">
          {shade.name}
          <span
            className={cn(
              "ml-1 font-normal",
              state === "base" ? "text-muted-foreground" : "text-primary",
            )}
          >
            · {TAGS[state]}
          </span>
        </b>
        <span className="font-mono text-[11px] text-muted-foreground">
          {colors[0]?.slice(0, 7)}
        </span>
      </div>
    </div>
  );
}
