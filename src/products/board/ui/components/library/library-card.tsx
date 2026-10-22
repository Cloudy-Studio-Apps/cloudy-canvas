import { ExtensionIconView } from "@canvas-ui";
import { cn } from "@shared/ui/lib/utils";
import type { LibraryCardProps } from "./library.types";

/** One item: a preview tile and its name. Items that aren't ready yet are shown, disabled. */
export function LibraryCard({ item, onPick }: LibraryCardProps) {
  const { icon, comingSoon } = item;

  return (
    <button
      type="button"
      disabled={comingSoon}
      title={item.description}
      onClick={() => onPick(item)}
      className={cn(
        "group flex flex-col items-center gap-1.5 rounded-md p-1.5 text-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        comingSoon ? "cursor-default" : "cursor-pointer hover:bg-hover",
      )}
    >
      <span className="relative flex aspect-[4/3] w-full items-center justify-center rounded-md border bg-surface">
        <ExtensionIconView
          icon={icon}
          className={cn(
            "size-8 transition-transform",
            comingSoon ? "text-subtle-foreground" : "text-foreground group-hover:scale-110",
          )}
          strokeWidth={1.5}
        />
        {comingSoon && (
          <span className="absolute top-1.5 right-1.5 rounded-sm bg-surface-sunken px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            Soon
          </span>
        )}
      </span>
      <span
        className={cn(
          "w-full truncate text-xs",
          comingSoon ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {item.label}
      </span>
    </button>
  );
}
