import { cn } from "@shared/ui/lib/utils";
import type { CreateTileProps } from "./create-tile.types";

/** A compact "New …" button: icon chip, title and a one-line hint. */
export function CreateTile({ icon, title, hint, onSelect, dashed, keyShortcuts }: CreateTileProps) {
  return (
    // eslint-disable-next-line no-restricted-syntax -- bespoke: Home's create tile
    <button
      type="button"
      onClick={onSelect}
      aria-keyshortcuts={keyShortcuts}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-card border p-3 text-left",
        dashed ? "border-dashed border-border-strong" : "bg-surface shadow-soft",
        "transition-[box-shadow,border-color,background-color] duration-200",
        dashed ? "hover:bg-hover" : "hover:border-border-strong hover:shadow-lifted",
        "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
      )}
    >
      {icon}
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
