import { cn } from "@shared/ui/lib/utils";
import type { SwatchProps } from "./swatch.types";

const SIZES = { xs: "size-3", sm: "size-4", md: "size-5" } as const;

/** A color chip, over a checkerboard so transparency shows. */
export function Swatch({ color, size = "sm", round, className, style, ...props }: SwatchProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block shrink-0 overflow-hidden border border-border-strong bg-[repeating-conic-gradient(var(--muted)_0_25%,var(--surface)_0_50%)] bg-[length:6px_6px]",
        round ? "rounded-full" : "rounded-xs",
        SIZES[size],
        className,
      )}
      style={style}
      {...props}
    >
      <span className="absolute inset-0" style={{ background: color }} />
    </span>
  );
}
