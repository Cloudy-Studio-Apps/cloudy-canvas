import { cn } from "@shared/ui/kit";
import type { LibraryStripProps } from "./library-strip.types";

/** A row of a library's colors side by side (a band when it is wide, a strip when it is small). */
export function LibraryStrip({ colors, className }: LibraryStripProps) {
  if (colors.length === 0) return <span className={cn("bg-muted", className)} aria-hidden />;
  return (
    <span className={cn("flex overflow-hidden", className)} aria-hidden>
      {colors.map((color, index) => (
        <i key={index} className="h-full flex-1" style={{ backgroundColor: color }} />
      ))}
    </span>
  );
}
